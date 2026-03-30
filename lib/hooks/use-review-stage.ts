"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { applyReviewAction } from "@/lib/db/mutations";
import { getNextReviewWords } from "@/lib/db/queries";
import type { WordRecord } from "@/types/db";

export type ReviewStage = "attitude" | "meaning" | "card";

function matchesSentiment(sentiment: string, selected: "+" | "O" | "-"): boolean {
  if (selected === "+") return sentiment.includes("正");
  if (selected === "-") return sentiment.includes("负");
  return sentiment.includes("中");
}

function buildMeaningOptions(word: WordRecord): string[] {
  const candidates = [
    word.meaning,
    word.confusingMeaning1,
    word.confusingMeaning2,
    word.confusingMeaning3,
  ].filter(Boolean);

  // Fisher-Yates shuffle
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
  const [, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    setLoading(true);
    const words = await getNextReviewWords();
    setQueue(words);
    setStage("attitude");
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
    // 每次换词重新洗牌，相同词复现时也重新洗牌（刻意设计）
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wordId],
  );

  const handleAttitude = useCallback(
    async (selected: "+" | "O" | "-") => {
      if (!currentWord) return;
      if (matchesSentiment(currentWord.sentiment, selected)) {
        setStage("meaning");
      } else {
        await applyReviewAction(currentWord.id!, "fail");
        setStage("card");
      }
    },
    [currentWord],
  );

  const handleForget = useCallback(async () => {
    if (!currentWord) return;
    await applyReviewAction(currentWord.id!, "fail");
    setStage("card");
  }, [currentWord]);

  const handleMeaning = useCallback(
    async (selected: string) => {
      if (!currentWord) return;
      if (selected === currentWord.meaning) {
        await applyReviewAction(currentWord.id!, "success");
        await refresh();
      } else {
        await applyReviewAction(currentWord.id!, "fail");
        setStage("card");
      }
    },
    [currentWord, refresh],
  );

  const handleNextWord = useCallback(async () => {
    await refresh();
  }, [refresh]);

  return {
    loading,
    currentWord,
    stage,
    meaningOptions,
    handleAttitude,
    handleForget,
    handleMeaning,
    handleNextWord,
  };
}
