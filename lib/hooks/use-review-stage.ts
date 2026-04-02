"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { judgeMeaningAnswer } from "@/lib/ai/client";
import { parseMeaningJudgement } from "@/lib/ai/parser";
import { applyReviewAction } from "@/lib/db/mutations";
import { getNextReviewWords } from "@/lib/db/queries";
import { useSettings } from "@/lib/hooks/use-settings";
import type { WordRecord } from "@/types/db";
import type { ReviewAction } from "@/types/review";

export type ReviewStage = "attitude" | "meaning" | "card";
export type ReviewOutcome = ReviewAction | null;

function matchesSentiment(sentiment: string, selected: "+" | "O" | "-"): boolean {
  if (selected === "+") return sentiment.includes("正");
  if (selected === "-") return sentiment.includes("负");
  return sentiment.includes("中");
}

export function useReviewStage() {
  const { settings } = useSettings();
  const [queue, setQueue] = useState<WordRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<ReviewStage>("attitude");
  const [outcome, setOutcome] = useState<ReviewOutcome>(null);
  const [meaningInput, setMeaningInput] = useState("");
  const [meaningError, setMeaningError] = useState("");
  const [meaningSubmitting, setMeaningSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  const resetMeaningState = useCallback(() => {
    setMeaningInput("");
    setMeaningError("");
    setMeaningSubmitting(false);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const words = await getNextReviewWords();
    setQueue(words);
    setStage("attitude");
    setOutcome(null);
    resetMeaningState();
    setLoading(false);
  }, [resetMeaningState]);

  useEffect(() => {
    startTransition(() => {
      void refresh();
    });
  }, [refresh]);

  const currentWord = queue[0] ?? null;

  const revealCard = useCallback((nextOutcome: ReviewOutcome) => {
    setOutcome(nextOutcome);
    setStage("card");
  }, []);

  const handleAttitude = useCallback(
    async (selected: "+" | "O" | "-") => {
      if (!currentWord) return;
      if (matchesSentiment(currentWord.sentiment, selected)) {
        resetMeaningState();
        setStage("meaning");
        return;
      }

      await applyReviewAction(currentWord.id!, "fail");
      revealCard("fail");
    },
    [currentWord, resetMeaningState, revealCard],
  );

  const handleForget = useCallback(async () => {
    if (!currentWord) return;
    await applyReviewAction(currentWord.id!, "fail");
    revealCard("fail");
  }, [currentWord, revealCard]);

  const handleMeaningInputChange = useCallback((value: string) => {
    setMeaningInput(value);
    if (meaningError) {
      setMeaningError("");
    }
  }, [meaningError]);

  const handleMeaningSubmit = useCallback(async () => {
    if (!currentWord || meaningSubmitting) {
      return;
    }

    const trimmedInput = meaningInput.trim();
    if (!trimmedInput) {
      setMeaningError("先写下你理解的词义再提交");
      return;
    }

    if (!settings.aiApiKey || !settings.aiModelName) {
      setMeaningError("请先在设置页填写 AI API Key 和模型");
      return;
    }

    setMeaningError("");
    setMeaningSubmitting(true);

    try {
      const response = await judgeMeaningAnswer({
        apiKey: settings.aiApiKey,
        baseUrl: settings.aiBaseUrl,
        modelName: settings.aiModelName,
        spell: currentWord.spell,
        meaning: currentWord.meaning,
        deodorizedMeaning: currentWord.deodorizedMeaning,
        usageExplanation: currentWord.usageExplanation,
        userAnswer: trimmedInput,
      });

      const judgement = parseMeaningJudgement(response);
      const nextOutcome = judgement.verdict === "correct" ? "success" : "fail";
      await applyReviewAction(currentWord.id!, nextOutcome);
      revealCard(nextOutcome);
    } catch (submissionError) {
      setMeaningError(submissionError instanceof Error ? submissionError.message : "判定失败，请稍后重试");
    } finally {
      setMeaningSubmitting(false);
    }
  }, [currentWord, meaningInput, meaningSubmitting, revealCard, settings]);

  const handleNextWord = useCallback(async () => {
    await refresh();
  }, [refresh]);

  return {
    loading,
    currentWord,
    stage,
    outcome,
    meaningInput,
    meaningError,
    meaningSubmitting,
    handleAttitude,
    handleForget,
    handleMeaningInputChange,
    handleMeaningSubmit,
    handleNextWord,
  };
}
