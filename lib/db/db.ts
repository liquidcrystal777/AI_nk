import Dexie, { type EntityTable } from "dexie";
import type { SettingsRecord, WordRecord } from "@/types/db";

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
  }
}

export const db = new VocabularyDatabase();
