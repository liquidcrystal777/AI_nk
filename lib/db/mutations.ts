import { db } from "@/lib/db/db";
import { getNextReviewTime, getNextStatus } from "@/lib/review/state-machine";
import { DEFAULT_SETTINGS, SETTINGS_ID } from "@/lib/utils/constants";
import { normalizeMultilineText, normalizeSingleLineText } from "@/lib/utils/text";
import type { RecordDraft, SettingsRecord, WordRecord } from "@/types/db";
import type { ReviewAction } from "@/types/review";

export async function saveSettings(input: Omit<SettingsRecord, "id">) {
  return db.settings.put({
    ...DEFAULT_SETTINGS,
    ...input,
    id: SETTINGS_ID,
  });
}

export async function createWord(draft: RecordDraft) {
  const now = Date.now();

  return db.words.add({
    spell: normalizeSingleLineText(draft.spell),
    partOfSpeech: normalizeSingleLineText(draft.partOfSpeech),
    meaning: normalizeSingleLineText(draft.meaning),
    confusingMeaning1: normalizeSingleLineText(draft.confusingMeaning1),
    confusingMeaning2: normalizeSingleLineText(draft.confusingMeaning2),
    confusingMeaning3: normalizeSingleLineText(draft.confusingMeaning3),
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

export async function clearAllWords() {
  return db.words.clear();
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
