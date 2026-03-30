"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { applyReviewAction } from "@/lib/db/mutations";
import { getAllWords, getNextReviewWords } from "@/lib/db/queries";
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

function splitMeaningParts(input: string) {
  return normalizeSingleLineText(input)
    .split(/[，,、\/；;｜|]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeMeaningOptionText(input: string, expectedPartCount?: number) {
  const normalized = normalizeSingleLineText(input)
    .replace(/[（(][^（）()]*[）)]/g, "")
    .replace(/[：:]/g, "，")
    .replace(/[。；;]/g, "，");

  const compact = normalizeCompactChineseList(normalized, expectedPartCount || 2) || normalizeSingleLineText(input);
  return compact;
}

function normalizeSpell(input: string) {
  return normalizeSingleLineText(input).toLowerCase();
}

function buildBigrams(input: string) {
  if (input.length < 2) {
    return [input].filter(Boolean);
  }

  const result: string[] = [];
  for (let index = 0; index < input.length - 1; index += 1) {
    result.push(input.slice(index, index + 2));
  }
  return result;
}

function scoreSpellSimilarity(targetSpell: string, candidateSpell: string) {
  if (!targetSpell || !candidateSpell || targetSpell === candidateSpell) {
    return 0;
  }

  let score = 0;
  const minLength = Math.min(targetSpell.length, candidateSpell.length);

  for (let index = 0; index < minLength; index += 1) {
    if (targetSpell[index] !== candidateSpell[index]) {
      break;
    }
    score += 3;
  }

  for (let index = 1; index <= minLength; index += 1) {
    if (targetSpell[targetSpell.length - index] !== candidateSpell[candidateSpell.length - index]) {
      break;
    }
    score += 2;
  }

  const targetBigrams = buildBigrams(targetSpell);
  const candidateBigrams = new Set(buildBigrams(candidateSpell));
  score += targetBigrams.filter((gram) => candidateBigrams.has(gram)).length * 2;
  score -= Math.abs(targetSpell.length - candidateSpell.length);

  return score;
}

function scoreMeaningShape(correctMeaning: string, candidateMeaning: string) {
  const correctParts = splitMeaningParts(correctMeaning);
  const candidateParts = splitMeaningParts(candidateMeaning);

  let score = 0;
  score -= Math.abs(correctParts.length - candidateParts.length) * 4;
  score -= Math.abs(correctMeaning.length - candidateMeaning.length) * 0.08;

  if (correctParts.length > 1 && candidateParts.length > 1) {
    score += 4;
  }

  if (correctParts.length === candidateParts.length) {
    score += 3;
  }

  return score;
}

function buildMeaningOptions(word: WordRecord, wordPool: WordRecord[]): MeaningOption[] {
  const correctMeaning = normalizeSingleLineText(word.meaning);
  const normalizedCorrectText = normalizeMeaningOptionText(correctMeaning, Math.max(2, splitMeaningParts(correctMeaning).length || 2));
  const expectedPartCount = Math.max(2, splitMeaningParts(correctMeaning).length || 2);
  const targetSpell = normalizeSpell(word.spell);
  const targetPartOfSpeech = normalizeSingleLineText(word.partOfSpeech);

  const distractorsFromPool = wordPool
    .filter((candidate) => candidate.id !== word.id)
    .map((candidate) => {
      const candidateMeaning = normalizeSingleLineText(candidate.meaning);
      const candidateSpell = normalizeSpell(candidate.spell);
      const candidatePartOfSpeech = normalizeSingleLineText(candidate.partOfSpeech);

      return {
        id: `word-${candidate.id}`,
        spell: candidateSpell,
        text: normalizeMeaningOptionText(candidateMeaning, expectedPartCount),
        partOfSpeech: candidatePartOfSpeech || "词义",
        isCorrect: false,
        score:
          scoreSpellSimilarity(targetSpell, candidateSpell) +
          scoreMeaningShape(correctMeaning, candidateMeaning) +
          (candidatePartOfSpeech && candidatePartOfSpeech === targetPartOfSpeech ? 6 : 0),
      };
    })
    .filter((candidate) => candidate.text && candidate.spell && candidate.text !== normalizedCorrectText)
    .sort((left, right) => right.score - left.score)
    .filter((candidate, index, array) => array.findIndex((item) => item.text === candidate.text) === index)
    .slice(0, 3)
    .map(({ id, text, partOfSpeech, isCorrect }) => ({ id, text, partOfSpeech, isCorrect }));

  const fallbackDistractors = [
    { id: "confusing-1", text: word.confusingMeaning1 },
    { id: "confusing-2", text: word.confusingMeaning2 },
    { id: "confusing-3", text: word.confusingMeaning3 },
  ]
    .map((candidate) => ({
      ...candidate,
      text: normalizeMeaningOptionText(candidate.text, expectedPartCount),
      partOfSpeech: targetPartOfSpeech || "词义",
      isCorrect: false,
    }))
    .filter((candidate) => candidate.text && candidate.text !== normalizedCorrectText)
    .filter((candidate) => !distractorsFromPool.some((item) => item.text === candidate.text));

  const candidates = [
    {
      id: "correct",
      text: normalizedCorrectText,
      partOfSpeech: targetPartOfSpeech || "词义",
      isCorrect: true,
    },
    ...distractorsFromPool,
    ...fallbackDistractors,
  ]
    .filter((candidate, index, array) => array.findIndex((item) => item.text === candidate.text) === index)
    .slice(0, 4);

  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  return candidates;
}

export function useReviewStage() {
  const [queue, setQueue] = useState<WordRecord[]>([]);
  const [wordPool, setWordPool] = useState<WordRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<ReviewStage>("attitude");
  const [outcome, setOutcome] = useState<ReviewOutcome>(null);
  const [, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    setLoading(true);
    const [words, allWords] = await Promise.all([getNextReviewWords(), getAllWords()]);
    setQueue(words);
    setWordPool(allWords);
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
    () => (currentWord ? buildMeaningOptions(currentWord, wordPool) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wordId, wordPool],
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
