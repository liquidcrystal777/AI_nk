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
  pronunciation?: string;
  meaning: string;
  prompt: string;
  year: string;
  sourceTextId: string;
  originalSentence: string[];
  status: WordStatus;
  reviewCount: number;
  lastReviewTime?: number;
  nextReviewTime: number;
};

export type RecordDraft = {
  spell: string;
  pronunciation: string;
  meaning: string;
  prompt: string;
  year: string;
  sourceTextId: string;
  originalSentence: string[];
};

export type BrowseFilters = {
  keyword: string;
  year: string;
  sourceTextId: string;
};
