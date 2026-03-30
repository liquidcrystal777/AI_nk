import Dexie, { type EntityTable, type Transaction } from "dexie";
import type { SettingsRecord, WordRecord } from "@/types/db";
import { DEFAULT_SETTINGS, SETTINGS_ID } from "@/lib/utils/constants";

type LegacyWordRecord = {
  id?: number;
  spell?: string;
  pronunciation?: string;
  meaning?: string;
  confusingMeaning1?: string;
  confusingMeaning2?: string;
  confusingMeaning3?: string;
  prompt?: string;
  year?: string;
  sourceTextId?: string;
  originalSentence?: string[] | string;
  usageExplanation?: string;
  sentiment?: string;
  deodorizedMeaning?: string;
  partOfSpeech?: string;
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

function normalizeLegacySingleLine(input: unknown) {
  return String(input ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

async function ensureSettingsRecord(transaction: Transaction) {
  const settingsTable = transaction.table("settings");
  const current = await settingsTable.get(SETTINGS_ID);

  if (!current) {
    await settingsTable.put(DEFAULT_SETTINGS);
  }
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
        await ensureSettingsRecord(transaction);

        await transaction
          .table("words")
          .toCollection()
          .modify((word: LegacyWordRecord) => {
            const originalSentence = normalizeLegacySentence(word.originalSentence);

            delete word.pronunciation;
            delete word.prompt;

            word.spell = normalizeLegacySingleLine(word.spell);
            word.meaning = normalizeLegacySingleLine(word.meaning);
            word.originalSentence = originalSentence;
            word.usageExplanation = String(word.usageExplanation ?? "").trim();
            word.deodorizedMeaning = String(word.deodorizedMeaning ?? "").trim();
            word.year = normalizeLegacySingleLine(word.year);
            word.sourceTextId = normalizeLegacySingleLine(word.sourceTextId);
            word.reviewCount = Number(word.reviewCount ?? 0);
            word.nextReviewTime = Number(word.nextReviewTime ?? Date.now());
          });
      });

    this.version(4)
      .stores({
        settings: "id",
        words:
          "++id, spell, partOfSpeech, sentiment, status, year, sourceTextId, nextReviewTime, [year+sourceTextId], [status+nextReviewTime]",
      })
      .upgrade(async (transaction) => {
        await ensureSettingsRecord(transaction);

        await transaction
          .table("words")
          .toCollection()
          .modify((word: LegacyWordRecord) => {
            word.spell = normalizeLegacySingleLine(word.spell);
            word.partOfSpeech = normalizeLegacySingleLine(word.partOfSpeech);
            word.meaning = normalizeLegacySingleLine(word.meaning);
            word.confusingMeaning1 = normalizeLegacySingleLine(word.confusingMeaning1);
            word.confusingMeaning2 = normalizeLegacySingleLine(word.confusingMeaning2);
            word.confusingMeaning3 = normalizeLegacySingleLine(word.confusingMeaning3);
            word.originalSentence = normalizeLegacySentence(word.originalSentence);
            word.usageExplanation = String(word.usageExplanation ?? "").trim();
            word.sentiment = normalizeLegacySingleLine(word.sentiment);
            word.deodorizedMeaning = String(word.deodorizedMeaning ?? "").trim();
            word.year = normalizeLegacySingleLine(word.year);
            word.sourceTextId = normalizeLegacySingleLine(word.sourceTextId);
            word.reviewCount = Number(word.reviewCount ?? 0);
            word.nextReviewTime = Number(word.nextReviewTime ?? Date.now());
          });
      });

    this.version(5)
      .stores({
        settings: "id",
        words:
          "++id, spell, partOfSpeech, sentiment, status, year, sourceTextId, nextReviewTime, [year+sourceTextId], [status+nextReviewTime]",
      })
      .upgrade(async (transaction) => {
        await ensureSettingsRecord(transaction);
      });
  }
}

export const db = new VocabularyDatabase();
