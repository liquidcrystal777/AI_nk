export type ThemeMode = "light" | "dark";

export type WordStatus = "new" | "vague" | "known" | "mastered";

export type RecordMode = "reading" | "general";

export type CardType = "normal" | "phrase" | "rare_meaning" | "comparison";

export type ComparisonWordInfo = {
  spell: string;
  meaning: string;
  keyDifference: string;
  collocation: string;
};

export type ComparisonContent = {
  wordA: ComparisonWordInfo;
  wordB: ComparisonWordInfo;
};

export type SettingsRecord = {
  id: 1;
  aiApiKey: string;
  aiBaseUrl: string;
  aiModelName: string;
  theme: ThemeMode;
};

export type WordRecord = {
  id?: number;
  spell: string;
  partOfSpeech: string;
  meaning: string;
  originalSentence: string;
  representativeSentence?: string;
  usageExplanation: string;
  rootMemory?: string;
  associationMemory?: string;
  sentiment: string;
  deodorizedMeaning: string;
  year: string;
  sourceTextId: string;
  mode: RecordMode;
  status: WordStatus;
  reviewCount: number;
  lastReviewTime?: number;
  nextReviewTime: number;
  cardType: CardType;
  excludeFromReview: boolean;
  comparisonData?: ComparisonContent;
  structureAnalysis?: string;
  collocationTrap?: string;
  typicalContext?: string;
};

export type RecordDraft = {
  spell: string;
  partOfSpeech: string;
  meaning: string;
  originalSentence: string;
  representativeSentence: string;
  usageExplanation: string;
  rootMemory?: string;
  associationMemory?: string;
  sentiment: string;
  deodorizedMeaning: string;
  year: string;
  sourceTextId: string;
  mode: RecordMode;
  cardType: CardType;
  excludeFromReview: boolean;
  comparisonData?: ComparisonContent;
  structureAnalysis?: string;
  collocationTrap?: string;
  typicalContext?: string;
  comparisonWordA?: string;
  comparisonWordB?: string;
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
  format: "ai-nk-backup";
  formatVersion: 1;
  exportedAt: string;
  app: {
    name: string;
  };
  payload: BackupPayload;
};

export type ImportMode = "replace" | "append";
