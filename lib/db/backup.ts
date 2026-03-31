import { APP_NAME } from "@/lib/utils/constants";
import { normalizeMultilineText, normalizeSingleLineText } from "@/lib/utils/text";
import type { BackupFile, BackupPayload, ImportMode, SettingsRecord, WordRecord } from "@/types/db";

const BACKUP_FILE_FORMAT = "vocabulary-backup";
const BACKUP_FILE_VERSION = 1;

const WORD_STATUS_VALUES = new Set<WordRecord["status"]>(["new", "vague", "known", "mastered"]);

function normalizeBackupSettings(settings: SettingsRecord | null | undefined): SettingsRecord | null {
  if (!settings) {
    return null;
  }

  return {
    id: 1,
    aiApiKey: normalizeSingleLineText(settings.aiApiKey),
    aiBaseUrl: normalizeSingleLineText(settings.aiBaseUrl),
    aiModelName: normalizeSingleLineText(settings.aiModelName),
  };
}

export function normalizeBackupWord(word: WordRecord): Omit<WordRecord, "id"> {
  const reviewCount = Number.isFinite(word.reviewCount) ? Math.max(0, Math.floor(word.reviewCount)) : 0;
  const nextReviewTime = Number.isFinite(word.nextReviewTime) ? Number(word.nextReviewTime) : Date.now();
  const lastReviewTime = Number.isFinite(word.lastReviewTime) ? Number(word.lastReviewTime) : undefined;
  const status = WORD_STATUS_VALUES.has(word.status) ? word.status : "new";

  return {
    spell: normalizeSingleLineText(word.spell),
    partOfSpeech: normalizeSingleLineText(word.partOfSpeech),
    meaning: normalizeSingleLineText(word.meaning),
    originalSentence: normalizeMultilineText(word.originalSentence),
    usageExplanation: normalizeMultilineText(word.usageExplanation),
    sentiment: normalizeSingleLineText(word.sentiment),
    deodorizedMeaning: normalizeMultilineText(word.deodorizedMeaning),
    year: normalizeSingleLineText(word.year),
    sourceTextId: normalizeSingleLineText(word.sourceTextId),
    status,
    reviewCount,
    lastReviewTime,
    nextReviewTime,
  };
}

export function buildWordImportKey(word: Pick<WordRecord, "spell" | "year" | "sourceTextId" | "meaning">) {
  return [word.spell, word.year, word.sourceTextId, word.meaning]
    .map((value) => normalizeSingleLineText(value).toLowerCase())
    .join("::");
}

export function createBackupFile(payload: BackupPayload): BackupFile {
  return {
    format: BACKUP_FILE_FORMAT,
    formatVersion: BACKUP_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    app: {
      name: APP_NAME,
    },
    payload: {
      settings: normalizeBackupSettings(payload.settings),
      words: payload.words.map((word) => ({ ...normalizeBackupWord(word) })),
    },
  };
}

export function createBackupFilename() {
  const stamp = new Date().toISOString().replace(/[:]/g, "-").replace(/\..+$/, "");
  return `vocabulary-backup-${stamp}.json`;
}

export function downloadBackupFile(file: BackupFile) {
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = createBackupFilename();
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function isBackupPayload(value: unknown): value is BackupPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return Array.isArray(payload.words) && (payload.settings === null || typeof payload.settings === "object");
}

export function parseBackupFileContent(content: string): BackupFile {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("备份文件不是合法 JSON，请重新导出后再试");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("备份文件结构无效");
  }

  const backup = parsed as Record<string, unknown>;

  if (backup.format !== BACKUP_FILE_FORMAT) {
    throw new Error("不是本应用的备份文件");
  }

  if (backup.formatVersion !== BACKUP_FILE_VERSION) {
    throw new Error(`暂不支持该备份版本：${String(backup.formatVersion)}`);
  }

  if (!isBackupPayload(backup.payload)) {
    throw new Error("备份文件缺少 payload.words 或 payload.settings");
  }

  return createBackupFile(backup.payload);
}

export function getImportModeLabel(mode: ImportMode) {
  return mode === "replace" ? "覆盖导入" : "追加导入";
}
