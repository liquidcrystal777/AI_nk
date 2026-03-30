export const SETTINGS_ID = 1 as const;
export const APP_NAME = "考研英语神器";
export const APP_PURPLE = "#660874";
export const DEFAULT_AI_BASE_URL = "https://api.deepseek.com/v1";
export const DEFAULT_AI_MODEL_NAME = "deepseek-chat";

export const REVIEW_DELAYS = {
  fail: 5 * 60 * 1000,
  again: 20 * 60 * 1000,
  promote: 12 * 60 * 60 * 1000,
  master: 3 * 24 * 60 * 60 * 1000,
  mastered: 7 * 24 * 60 * 60 * 1000,
} as const;

export const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  aiApiKey: "",
  aiBaseUrl: "",
  aiModelName: DEFAULT_AI_MODEL_NAME,
};
