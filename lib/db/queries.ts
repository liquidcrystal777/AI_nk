import { liveQuery } from "dexie";
import { db } from "@/lib/db/db";
import { DEFAULT_AI_MODEL_NAME, DEFAULT_SETTINGS, SETTINGS_ID } from "@/lib/utils/constants";
import { normalizeSingleLineText } from "@/lib/utils/text";
import type { BackupPayload, BrowseFilters, SettingsRecord, WordRecord, WordStatus } from "@/types/db";

const WORD_STATUS_PRIORITY: Record<WordStatus, number> = {
  new: 0,
  vague: 1,
  known: 2,
  mastered: 3,
};

function resolveSettings(settings?: Partial<SettingsRecord>): SettingsRecord {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    id: SETTINGS_ID,
    aiApiKey: settings?.aiApiKey?.trim() ?? DEFAULT_SETTINGS.aiApiKey,
    aiBaseUrl: settings?.aiBaseUrl?.trim() ?? DEFAULT_SETTINGS.aiBaseUrl,
    aiModelName: settings?.aiModelName?.trim() || DEFAULT_AI_MODEL_NAME,
    theme: normalizeSingleLineText(settings?.theme || DEFAULT_SETTINGS.theme) === "dark" ? "dark" : DEFAULT_SETTINGS.theme,
  };
}

function compareBrowseWords(a: WordRecord, b: WordRecord) {
  const statusDiff = WORD_STATUS_PRIORITY[a.status] - WORD_STATUS_PRIORITY[b.status];
  if (statusDiff !== 0) {
    return statusDiff;
  }

  const nextReviewDiff = a.nextReviewTime - b.nextReviewTime;
  if (nextReviewDiff !== 0) {
    return nextReviewDiff;
  }

  const reviewCountDiff = a.reviewCount - b.reviewCount;
  if (reviewCountDiff !== 0) {
    return reviewCountDiff;
  }

  return a.spell.localeCompare(b.spell);
}

export async function getSettings(): Promise<SettingsRecord> {
  const settings = await db.settings.get(SETTINGS_ID);
  return resolveSettings(settings);
}

export function watchSettings() {
  return liveQuery(() => getSettings());
}

export async function getWordCount() {
  return db.words.count();
}

export async function getDueCount(now = Date.now()) {
  const count = await db.words
    .where("nextReviewTime")
    .belowOrEqual(now)
    .filter((word) => !word.excludeFromReview)
    .count();
  return count;
}

export async function getBrowseWords(filters: BrowseFilters): Promise<WordRecord[]> {
  let words = await db.words.toArray();

  if (filters.year) {
    words = words.filter((word) => word.year === filters.year);
  }

  if (filters.sourceTextId) {
    words = words.filter((word) => word.sourceTextId === filters.sourceTextId);
  }

  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    words = words.filter((word) => {
      return word.spell.toLowerCase().includes(keyword);
    });
  }

  return words.sort(compareBrowseWords);
}

export async function getBrowseFilterOptions() {
  const words = await db.words.toArray();
  const years = Array.from(new Set(words.map((word) => word.year).filter(Boolean))).sort();
  const sourceTextIds = Array.from(
    new Set(words.map((word) => word.sourceTextId).filter(Boolean)),
  ).sort();

  return { years, sourceTextIds };
}

export async function getNextReviewWords(now = Date.now(), limit = 20) {
  const dueWords = await db.words
    .where("nextReviewTime")
    .belowOrEqual(now)
    .filter((word) => !word.excludeFromReview)
    .sortBy("nextReviewTime");
  return dueWords.slice(0, limit);
}

export async function getAllWords() {
  return db.words.toArray();
}

export async function getBackupPayload(): Promise<BackupPayload> {
  const [settings, words] = await Promise.all([db.settings.get(SETTINGS_ID), db.words.toArray()]);
  return {
    settings: settings ? resolveSettings(settings) : null,
    words,
  };
}

export async function getNextReviewWord(now = Date.now()) {
  const words = await getNextReviewWords(now, 1);
  return words[0] ?? null;
}
