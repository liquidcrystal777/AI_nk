export type AiWordDraftPayload = {
  spell?: string;
  partOfSpeech?: string;
  meaning?: string;
  originalSentence?: string;
  representativeSentence?: string;
  usageExplanation?: string;
  rootMemory?: string;
  associationMemory?: string;
  sentiment?: string;
  deodorizedMeaning?: string;
  suggestedComparison?: {
    targetSpell: string;
    reason: string;
  };
};

export type AiPhraseDraftPayload = {
  spell?: string;
  partOfSpeech?: string;
  meaning?: string;
  originalSentence?: string;
  structureAnalysis?: string;
  collocationTrap?: string;
  typicalContext?: string;
  sentiment?: string;
};

export type AiRareMeaningDraftPayload = {
  spell?: string;
  partOfSpeech?: string;
  meaning?: string;
  originalSentence?: string;
  usageExplanation?: string;
  sentiment?: string;
  rareMeaningAnalysis?: string;
};

export type AiComparisonWordInfo = {
  spell?: string;
  partOfSpeech?: string;
  meaning?: string;
  usageExplanation?: string;
  keyDifference?: string;
};

export type AiComparisonDraftPayload = {
  wordA?: AiComparisonWordInfo;
  wordB?: AiComparisonWordInfo;
  commonContext?: string;
  contrastSummary?: string;
};

export type AiMeaningJudgementPayload = {
  verdict?: string;
  confidence?: number | string;
  reason?: string;
  acceptedAnswer?: string;
};
