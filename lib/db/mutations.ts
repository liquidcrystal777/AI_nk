import { buildWordImportKey, normalizeBackupWord } from "@/lib/db/backup";
import { db } from "@/lib/db/db";
import { getNextReviewTime, getNextStatus } from "@/lib/review/state-machine";
import { DEFAULT_AI_MODEL_NAME, DEFAULT_SETTINGS, SETTINGS_ID } from "@/lib/utils/constants";
import { normalizeMultilineText, normalizeSingleLineText } from "@/lib/utils/text";
import type { ImportMode, RecordDraft, SettingsRecord, WordRecord } from "@/types/db";
import type { ReviewAction } from "@/types/review";

function normalizeSettingsInput(input: Omit<SettingsRecord, "id">): Omit<SettingsRecord, "id"> {
  return {
    aiApiKey: input.aiApiKey.trim(),
    aiBaseUrl: input.aiBaseUrl.trim(),
    aiModelName: input.aiModelName.trim() || DEFAULT_AI_MODEL_NAME,
  };
}

export async function saveSettings(input: Omit<SettingsRecord, "id">) {
  const current = await db.settings.get(SETTINGS_ID);

  return db.settings.put({
    ...(current ?? DEFAULT_SETTINGS),
    ...normalizeSettingsInput(input),
    id: SETTINGS_ID,
  });
}

export async function createWord(draft: RecordDraft) {
  const now = Date.now();

  return db.words.add({
    spell: normalizeSingleLineText(draft.spell),
    partOfSpeech: normalizeSingleLineText(draft.partOfSpeech),
    meaning: normalizeSingleLineText(draft.meaning),
    originalSentence: normalizeMultilineText(draft.originalSentence),
    usageExplanation: normalizeMultilineText(draft.usageExplanation),
    sentiment: normalizeSingleLineText(draft.sentiment),
    deodorizedMeaning: normalizeMultilineText(draft.deodorizedMeaning),
    year: normalizeSingleLineText(draft.year),
    sourceTextId: normalizeSingleLineText(draft.sourceTextId),
    status: "new",
    reviewCount: 0,
    nextReviewTime: now,
  });
}

export async function updateWord(id: number, patch: Partial<WordRecord>) {
  return db.words.update(id, patch);
}

export async function deleteWord(id: number) {
  return db.words.delete(id);
}

export async function importBackupPayload(
  input: {
    settings: SettingsRecord | null;
    words: WordRecord[];
  },
  mode: ImportMode,
) {
  const normalizedWords = input.words.map((word) => normalizeBackupWord(word));

  await db.transaction("rw", db.settings, db.words, async () => {
    if (mode === "replace") {
      await db.words.clear();
      await db.words.bulkAdd(normalizedWords);

      if (input.settings) {
        await db.settings.put({
          ...DEFAULT_SETTINGS,
          ...normalizeSettingsInput(input.settings),
          id: SETTINGS_ID,
        });
      }

      return;
    }

    const existingWords = await db.words.toArray();
    const existingKeys = new Set(existingWords.map((word) => buildWordImportKey(word)));
    const wordsToAdd = normalizedWords.filter((word) => {
      const key = buildWordImportKey(word);
      if (existingKeys.has(key)) {
        return false;
      }

      existingKeys.add(key);
      return true;
    });

    if (wordsToAdd.length > 0) {
      await db.words.bulkAdd(wordsToAdd);
    }
  });
}

export async function applyReviewAction(id: number, action: ReviewAction, now = Date.now()) {
  if (action === "skip") {
    return;
  }

  const word = await db.words.get(id);
  if (!word) {
    throw new Error("单词不存在，无法更新复习状态");
  }

  const nextStatus = getNextStatus(word.status, action);
  const nextReviewTime = getNextReviewTime(word.status, action, now);

  await db.words.update(id, {
    status: nextStatus,
    reviewCount: word.reviewCount + 1,
    lastReviewTime: now,
    nextReviewTime,
  });
}
