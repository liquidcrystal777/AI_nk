export type WordStatus = "new" | "vague" | "known" | "mastered";

export type SettingsRecord = {
  id: 1;
  aiApiKey: string;
  aiBaseUrl: string;
  aiModelName: string;
};

export type WordRecord = {
  id?: number;
  spell: string;
  partOfSpeech: string;
  meaning: string;
  originalSentence: string;
  usageExplanation: string;
  sentiment: string;
  deodorizedMeaning: string;
  year: string;
  sourceTextId: string;
  status: WordStatus;
  reviewCount: number;
  lastReviewTime?: number;
  nextReviewTime: number;
};

export type RecordDraft = {
  spell: string;
  partOfSpeech: string;
  meaning: string;
  originalSentence: string;
  usageExplanation: string;
  sentiment: string;
  deodorizedMeaning: string;
  year: string;
  sourceTextId: string;
};

export type BrowseFilters = {
  keyword: string;
  year: string;
  sourceTextId: string;
};

export type BackupPayload = {
  settings: SettingsRecord | null;
  words: WordRecord[];
};

export type BackupFile = {
  format: "vocabulary-backup";
  formatVersion: 1;
  exportedAt: string;
  app: {
    name: string;
  };
  payload: BackupPayload;
};

export type ImportMode = "replace" | "append";
