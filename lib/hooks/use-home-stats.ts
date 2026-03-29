"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDueCount, getWordCount } from "@/lib/db/queries";

export function useHomeStats() {
  const totalWords = useLiveQuery(() => getWordCount(), [], 0);
  const dueCount = useLiveQuery(() => getDueCount(), [], 0);

  return {
    totalWords,
    dueCount,
  };
}
