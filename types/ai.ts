export type AiWordDraftPayload = {
  spell?: string;
  partOfSpeech?: string;
  meaning?: string;
  originalSentence?: string;
  usageExplanation?: string;
  sentiment?: string;
  deodorizedMeaning?: string;
};

export type AiMeaningJudgementPayload = {
  verdict?: string;
  confidence?: number | string;
  reason?: string;
  acceptedAnswer?: string;
};
