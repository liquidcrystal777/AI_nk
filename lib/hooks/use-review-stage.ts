"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { applyReviewAction } from "@/lib/db/mutations";
import { getNextReviewWords } from "@/lib/db/queries";
import { normalizeCompactChineseList, normalizeSingleLineText } from "@/lib/utils/text";
import type { WordRecord } from "@/types/db";
import type { ReviewAction } from "@/types/review";

export type ReviewStage = "attitude" | "meaning" | "card";
export type ReviewOutcome = ReviewAction | null;
export type MeaningOption = {
  id: string;
  text: string;
  partOfSpeech: string;
  isCorrect: boolean;
};

function matchesSentiment(sentiment: string, selected: "+" | "O" | "-"): boolean {
  if (selected === "+") return sentiment.includes("正");
  if (selected === "-") return sentiment.includes("负");
  return sentiment.includes("中");
}

function normalizeMeaningOptionText(input: string) {
  const normalized = normalizeSingleLineText(input)
    .replace(/[（(][^（）()]*[）)]/g, "")
    .replace(/[：:]/g, "，")
    .replace(/[。；;]/g, "，");

  return normalizeCompactChineseList(normalized, 2) || normalizeSingleLineText(input);
}

function buildMeaningOptions(word: WordRecord): MeaningOption[] {
  const candidates = [
    { id: "correct", text: word.meaning, isCorrect: true },
    { id: "confusing-1", text: word.confusingMeaning1, isCorrect: false },
    { id: "confusing-2", text: word.confusingMeaning2, isCorrect: false },
    { id: "confusing-3", text: word.confusingMeaning3, isCorrect: false },
  ]
    .filter((candidate) => normalizeSingleLineText(candidate.text))
    .map((candidate) => ({
      ...candidate,
      text: normalizeMeaningOptionText(candidate.text),
      partOfSpeech: normalizeSingleLineText(word.partOfSpeech) || "词义",
    }));

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates;
}

export function useReviewStage() {
  const [queue, setQueue] = useState<WordRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<ReviewStage>("attitude");
  const [outcome, setOutcome] = useState<ReviewOutcome>(null);
  const [, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    setLoading(true);
    const words = await getNextReviewWords();
    setQueue(words);
    setStage("attitude");
    setOutcome(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    startTransition(() => {
      void refresh();
    });
  }, [refresh]);

  const currentWord = queue[0] ?? null;
  const wordId = currentWord?.id;

  const meaningOptions = useMemo(
    () => (currentWord ? buildMeaningOptions(currentWord) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wordId],
  );

  const revealCard = useCallback((nextOutcome: ReviewOutcome) => {
    setOutcome(nextOutcome);
    setStage("card");
  }, []);

  const handleAttitude = useCallback(
    async (selected: "+" | "O" | "-") => {
      if (!currentWord) return;
      if (matchesSentiment(currentWord.sentiment, selected)) {
        setStage("meaning");
        return;
      }

      await applyReviewAction(currentWord.id!, "fail");
      revealCard("fail");
    },
    [currentWord, revealCard],
  );

  const handleForget = useCallback(async () => {
    if (!currentWord) return;
    await applyReviewAction(currentWord.id!, "fail");
    revealCard("fail");
  }, [currentWord, revealCard]);

  const handleSkip = useCallback(() => {
    if (!currentWord) return;
    revealCard("skip");
  }, [currentWord, revealCard]);

  const handleMeaning = useCallback(
    async (selected: MeaningOption) => {
      if (!currentWord) return;
      if (selected.isCorrect) {
        await applyReviewAction(currentWord.id!, "success");
        revealCard("success");
        return;
      }

      await applyReviewAction(currentWord.id!, "fail");
      revealCard("fail");
    },
    [currentWord, revealCard],
  );

  const handleNextWord = useCallback(async () => {
    await refresh();
  }, [refresh]);

  return {
    loading,
    currentWord,
    stage,
    outcome,
    meaningOptions,
    handleAttitude,
    handleForget,
    handleSkip,
    handleMeaning,
    handleNextWord,
  };
}
