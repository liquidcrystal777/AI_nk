"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { applyReviewAction } from "@/lib/db/mutations";
import { getNextReviewWords } from "@/lib/db/queries";
import type { WordRecord } from "@/types/db";
import type { ReviewAction } from "@/types/review";

export function useReviewQueue() {
  const [queue, setQueue] = useState<WordRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    setLoading(true);
    const words = await getNextReviewWords();
    setQueue(words);
    setLoading(false);
  }, []);

  useEffect(() => {
    startTransition(() => {
      void refresh();
    });
  }, [refresh]);

  const currentWord = queue[0] ?? null;

  const handleAction = useCallback(
    async (action: ReviewAction) => {
      if (!currentWord) {
        return;
      }

      if (action === "skip") {
        setQueue((prev) => [...prev.slice(1), prev[0]].filter(Boolean) as WordRecord[]);
        return;
      }

      await applyReviewAction(currentWord.id!, action);
      await refresh();
    },
    [currentWord, refresh],
  );

  return {
    loading,
    currentWord,
    queue,
    handleAction,
    refresh,
  };
}
