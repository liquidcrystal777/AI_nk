import { db } from "@/lib/db/db";
import { getNextReviewTime, getNextStatus } from "@/lib/review/state-machine";
import { DEFAULT_SETTINGS, SETTINGS_ID } from "@/lib/utils/constants";
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
    spell: draft.spell.trim(),
    pronunciation: draft.pronunciation.trim(),
    meaning: draft.meaning.trim(),
    prompt: draft.prompt.trim(),
    year: draft.year.trim(),
    sourceTextId: draft.sourceTextId.trim(),
    originalSentence: draft.originalSentence.map((sentence) => sentence.trim()).filter(Boolean),
    status: "new",
    reviewCount: 0,
    nextReviewTime: now,
  });
}

export async function updateWord(id: number, patch: Partial<WordRecord>) {
  return db.words.update(id, patch);
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
