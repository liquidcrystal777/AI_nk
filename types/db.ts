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
  meaning: string;
  originalSentence: string;
  usageExplanation: string;
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
  meaning: string;
  originalSentence: string;
  usageExplanation: string;
  deodorizedMeaning: string;
  year: string;
  sourceTextId: string;
};

export type BrowseFilters = {
  keyword: string;
  year: string;
  sourceTextId: string;
};
