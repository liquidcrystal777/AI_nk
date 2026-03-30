import { liveQuery } from "dexie";
import { db } from "@/lib/db/db";
import { DEFAULT_AI_MODEL_NAME, DEFAULT_SETTINGS, SETTINGS_ID } from "@/lib/utils/constants";
import type { BackupPayload, BrowseFilters, SettingsRecord, WordRecord } from "@/types/db";

function resolveSettings(settings?: Partial<SettingsRecord>): SettingsRecord {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    id: SETTINGS_ID,
    aiApiKey: settings?.aiApiKey?.trim() ?? DEFAULT_SETTINGS.aiApiKey,
    aiBaseUrl: settings?.aiBaseUrl?.trim() ?? DEFAULT_SETTINGS.aiBaseUrl,
    aiModelName: settings?.aiModelName?.trim() || DEFAULT_AI_MODEL_NAME,
  };
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
  return db.words.where("nextReviewTime").belowOrEqual(now).count();
}

export async function getBrowseWords(filters: BrowseFilters): Promise<WordRecord[]> {
  let words = await db.words.orderBy("spell").toArray();

  if (filters.year) {
    words = words.filter((word) => word.year === filters.year);
  }

  if (filters.sourceTextId) {
    words = words.filter((word) => word.sourceTextId === filters.sourceTextId);
  }

  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    words = words.filter((word) => {
      return [
        word.spell,
        word.partOfSpeech,
        word.meaning,
        word.confusingMeaning1,
        word.confusingMeaning2,
        word.confusingMeaning3,
        word.originalSentence,
        word.usageExplanation,
        word.sentiment,
        word.deodorizedMeaning,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }

  return words;
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
  const dueWords = await db.words.where("nextReviewTime").belowOrEqual(now).sortBy("nextReviewTime");
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
