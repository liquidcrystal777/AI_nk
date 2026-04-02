import {
  cleanRareMeaningAnalysisPrefix,
  formatWordSpell,
  normalizeCompactChineseList,
  normalizeMultilineTextWithLimit,
  normalizePartOfSpeech,
  normalizeSingleLineText,
  takeFirstLine,
} from "@/lib/utils/text";
import type { AiComparisonDraftPayload, AiMeaningJudgementPayload, AiPhraseDraftPayload, AiRareMeaningDraftPayload } from "@/types/ai";
import type { ComparisonContent, ComparisonWordInfo, CardType, RecordDraft } from "@/types/db";

function extractJsonString(input: string) {
  const match = input.match(/\{[\s\S]*\}/);
  return match?.[0] ?? input;
}

function assertWordDraftPayload(payload: Record<string, unknown>, mode: RecordDraft["mode"]) {
  const spell = formatWordSpell(payload.spell);
  const partOfSpeech = normalizePartOfSpeech(payload.partOfSpeech);
  const meaning = normalizeCompactChineseList(payload.meaning);
  const originalSentence = takeFirstLine(payload.originalSentence);
  const representativeSentence = takeFirstLine(payload.representativeSentence);
  const usageExplanation = takeFirstLine(payload.usageExplanation);
  const rootMemory = takeFirstLine(payload.rootMemory);
  const associationMemory = takeFirstLine(payload.associationMemory);
  const sentiment = normalizeSingleLineText(payload.sentiment);
  const deodorizedMeaning = normalizeMultilineTextWithLimit(payload.deodorizedMeaning, 2);
  const effectiveSentence = mode === "general" ? representativeSentence || originalSentence : originalSentence;

  // 新字段优先，但向后兼容旧的 usageExplanation
  // 如果新字段为空，尝试从旧字段迁移
  const finalRootMemory = rootMemory || undefined;
  const finalAssociationMemory = associationMemory || undefined;

  // 验证必要字段
  if (!spell || !partOfSpeech || !meaning || !effectiveSentence || !sentiment || !deodorizedMeaning) {
    throw new Error("AI 返回的 JSON 字段不完整，请重试。必须包含单词、词性、极简释义、原文/代表句、态度、去味。");
  }

  // 新数据必须有两个记忆字段，旧数据可以只有 usageExplanation
  const hasNewMemoryFields = rootMemory || associationMemory;
  if (!hasNewMemoryFields && !usageExplanation) {
    throw new Error("AI 返回的 JSON 字段不完整，请重试。必须包含记忆内容（词根记忆和联想记忆）。");
  }

  return {
    spell,
    partOfSpeech,
    meaning,
    originalSentence: effectiveSentence,
    representativeSentence: mode === "general" ? effectiveSentence : representativeSentence,
    usageExplanation: usageExplanation || "",
    rootMemory: finalRootMemory,
    associationMemory: finalAssociationMemory,
    sentiment,
    deodorizedMeaning,
  };
}

function parseJsonObject(input: unknown) {
  let payload: Record<string, unknown> = {};

  if (typeof input === "string") {
    const jsonString = extractJsonString(input);
    try {
      payload = JSON.parse(jsonString) as Record<string, unknown>;
    } catch {
      throw new Error("AI 返回内容无法解析为 JSON，请重试。");
    }
  } else if (typeof input === "object" && input) {
    payload = input as Record<string, unknown>;

    if (typeof payload.raw === "string") {
      return parseJsonObject(payload.raw);
    }
  } else {
    throw new Error("AI 返回内容为空，请重试。");
  }

  return payload;
}

function assertMeaningJudgementPayload(payload: Record<string, unknown>) {
  const verdict = normalizeSingleLineText(payload.verdict).toLowerCase();
  const reason = takeFirstLine(payload.reason);
  const acceptedAnswer = normalizeCompactChineseList(payload.acceptedAnswer, 2) || normalizeSingleLineText(payload.acceptedAnswer);
  const confidenceRaw = payload.confidence;
  const confidence = typeof confidenceRaw === "number" ? confidenceRaw : Number(confidenceRaw);

  if ((verdict !== "correct" && verdict !== "incorrect") || !reason || !acceptedAnswer || Number.isNaN(confidence)) {
    throw new Error("AI 判题结果格式不完整，请重试。");
  }

  return {
    verdict,
    reason,
    acceptedAnswer,
    confidence: Math.max(0, Math.min(1, confidence)),
  } as const satisfies Required<AiMeaningJudgementPayload>;
}

export function parseWordDraft(
  input: unknown,
  context: Pick<RecordDraft, "year" | "sourceTextId" | "mode">
): RecordDraft {
  const payload = parseJsonObject(input);
  const normalized = assertWordDraftPayload(payload, context.mode);

  return {
    ...normalized,
    year: context.year,
    sourceTextId: context.sourceTextId,
    mode: context.mode,
    cardType: "normal",
    excludeFromReview: false,
  };
}

function assertPhraseDraftPayload(payload: Record<string, unknown>) {
  const spell = normalizeSingleLineText(payload.spell);
  const partOfSpeech = normalizePartOfSpeech(payload.partOfSpeech);
  const meaning = normalizeCompactChineseList(payload.meaning);
  const originalSentence = takeFirstLine(payload.originalSentence);
  const structureAnalysis = normalizeSingleLineText(payload.structureAnalysis);
  const collocationTrap = normalizeSingleLineText(payload.collocationTrap);
  const typicalContext = normalizeSingleLineText(payload.typicalContext);
  const sentiment = normalizeSingleLineText(payload.sentiment);

  if (!spell || !partOfSpeech || !meaning || !structureAnalysis) {
    throw new Error("AI 返回的词组 JSON 字段不完整，请重试。");
  }

  return {
    spell,
    partOfSpeech,
    meaning,
    originalSentence,
    structureAnalysis,
    collocationTrap,
    typicalContext,
    sentiment,
  };
}

export function parsePhraseDraft(
  input: unknown,
  context: Pick<RecordDraft, "year" | "sourceTextId" | "mode">
): RecordDraft {
  const payload = parseJsonObject(input);
  const normalized = assertPhraseDraftPayload(payload);

  return {
    spell: normalized.spell,
    partOfSpeech: normalized.partOfSpeech,
    meaning: normalized.meaning,
    originalSentence: normalized.originalSentence || "",
    representativeSentence: "",
    usageExplanation: normalized.structureAnalysis,
    sentiment: normalized.sentiment || "[中性]",
    deodorizedMeaning: normalized.collocationTrap || "",
    year: context.year,
    sourceTextId: context.sourceTextId,
    mode: context.mode,
    cardType: "phrase",
    excludeFromReview: false,
    structureAnalysis: normalized.structureAnalysis,
    collocationTrap: normalized.collocationTrap,
    typicalContext: normalized.typicalContext,
  };
}

function assertRareMeaningDraftPayload(payload: Record<string, unknown>) {
  const spell = formatWordSpell(payload.spell);
  const partOfSpeech = normalizePartOfSpeech(payload.partOfSpeech);
  const meaning = normalizeSingleLineText(payload.meaning);
  const originalSentence = takeFirstLine(payload.originalSentence);
  const usageExplanation = takeFirstLine(payload.usageExplanation);
  const sentiment = normalizeSingleLineText(payload.sentiment);
  // 清理可能存在的重复引导语前缀
  const rareMeaningAnalysis = cleanRareMeaningAnalysisPrefix(
    normalizeMultilineTextWithLimit(payload.rareMeaningAnalysis, 2)
  );

  if (!spell || !partOfSpeech || !meaning || !originalSentence || !rareMeaningAnalysis) {
    throw new Error("AI 返回的熟词僻义 JSON 字段不完整，请重试。");
  }

  return {
    spell,
    partOfSpeech,
    meaning,
    originalSentence,
    usageExplanation,
    sentiment,
    rareMeaningAnalysis,
  };
}

export function parseRareMeaningDraft(
  input: unknown,
  context: Pick<RecordDraft, "year" | "sourceTextId" | "mode">
): RecordDraft {
  const payload = parseJsonObject(input);
  const normalized = assertRareMeaningDraftPayload(payload);

  return {
    spell: normalized.spell,
    partOfSpeech: normalized.partOfSpeech,
    meaning: normalized.meaning,
    originalSentence: normalized.originalSentence,
    representativeSentence: "",
    usageExplanation: normalized.usageExplanation || "",
    sentiment: normalized.sentiment || "[中性]",
    deodorizedMeaning: normalized.rareMeaningAnalysis,
    year: context.year,
    sourceTextId: context.sourceTextId,
    mode: context.mode,
    cardType: "rare_meaning",
    excludeFromReview: false,
  };
}

function assertComparisonWordInfo(payload: Record<string, unknown>): ComparisonWordInfo {
  return {
    spell: formatWordSpell(payload.spell) || "",
    meaning: normalizeSingleLineText(payload.meaning) || "",
    collocation: normalizeSingleLineText(payload.collocation) || "",
    keyDifference: normalizeSingleLineText(payload.keyDifference) || "",
  };
}

function assertComparisonDraftPayload(payload: Record<string, unknown>): ComparisonContent {
  const wordA = assertComparisonWordInfo(payload.wordA as Record<string, unknown> || {});
  const wordB = assertComparisonWordInfo(payload.wordB as Record<string, unknown> || {});

  if (!wordA.spell || !wordB.spell) {
    throw new Error("AI 返回的对比辨析 JSON 字段不完整，请重试。");
  }

  return {
    wordA,
    wordB,
  };
}

export function parseComparisonDraft(
  input: unknown,
  wordA: string,
  wordB: string
): RecordDraft {
  const payload = parseJsonObject(input);
  const comparisonData = assertComparisonDraftPayload(payload);

  return {
    spell: `${wordA} vs ${wordB}`,
    partOfSpeech: "",
    meaning: "",
    originalSentence: "",
    representativeSentence: "",
    usageExplanation: "",
    sentiment: "[中性]",
    deodorizedMeaning: "",
    year: "",
    sourceTextId: "",
    mode: "general",
    cardType: "comparison",
    excludeFromReview: true,
    comparisonData,
  };
}

export function parseMeaningJudgement(input: unknown) {
  return assertMeaningJudgementPayload(parseJsonObject(input));
}
