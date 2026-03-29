import Dexie, { type EntityTable } from "dexie";
import type { SettingsRecord, WordRecord } from "@/types/db";

type LegacyWordRecord = {
  id?: number;
  spell?: string;
  pronunciation?: string;
  meaning?: string;
  prompt?: string;
  year?: string;
  sourceTextId?: string;
  originalSentence?: string[] | string;
  usageExplanation?: string;
  deodorizedMeaning?: string;
  status?: WordRecord["status"];
  reviewCount?: number;
  lastReviewTime?: number;
  nextReviewTime?: number;
};

function normalizeLegacySentence(input: LegacyWordRecord["originalSentence"]) {
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean).join("\n");
  }

  return String(input ?? "").trim();
}

export class VocabularyDatabase extends Dexie {
  settings!: EntityTable<SettingsRecord, "id">;
  words!: EntityTable<WordRecord, "id">;

  constructor() {
    super("vocabulary-local-db");

    this.version(1).stores({
      settings: "id",
      words:
        "++id, spell, status, year, sourceTextId, nextReviewTime, [year+sourceTextId], [status+nextReviewTime]",
    });

    this.version(2)
      .stores({
        settings: "id",
        words:
          "++id, spell, status, year, sourceTextId, nextReviewTime, [year+sourceTextId], [status+nextReviewTime]",
      })
      .upgrade(async (transaction) => {
        await transaction
          .table("words")
          .toCollection()
          .modify((word: LegacyWordRecord) => {
            const originalSentence = normalizeLegacySentence(word.originalSentence);

            delete word.pronunciation;
            delete word.prompt;

            word.spell = String(word.spell ?? "").trim();
            word.meaning = String(word.meaning ?? "").trim();
            word.originalSentence = originalSentence;
            word.usageExplanation = String(word.usageExplanation ?? "").trim();
            word.deodorizedMeaning = String(word.deodorizedMeaning ?? "").trim();
            word.year = String(word.year ?? "").trim();
            word.sourceTextId = String(word.sourceTextId ?? "").trim();
            word.reviewCount = Number(word.reviewCount ?? 0);
            word.nextReviewTime = Number(word.nextReviewTime ?? Date.now());
          });
      });
  }
}

export const db = new VocabularyDatabase();
