import {
  formatWordSpell,
  normalizeCompactChineseList,
  normalizeMultilineTextWithLimit,
  normalizeSingleLineText,
  takeFirstLine,
} from "@/lib/utils/text";
import type { AiMeaningJudgementPayload } from "@/types/ai";
import type { RecordDraft } from "@/types/db";

function extractJsonString(input: string) {
  const match = input.match(/\{[\s\S]*\}/);
  return match?.[0] ?? input;
}

function assertWordDraftPayload(payload: Record<string, unknown>) {
  const spell = formatWordSpell(payload.spell);
  const partOfSpeech = normalizeSingleLineText(payload.partOfSpeech);
  const meaning = normalizeCompactChineseList(payload.meaning);
  const originalSentence = takeFirstLine(payload.originalSentence);
  const usageExplanation = takeFirstLine(payload.usageExplanation);
  const sentiment = normalizeSingleLineText(payload.sentiment);
  const deodorizedMeaning = normalizeMultilineTextWithLimit(payload.deodorizedMeaning, 2);

  if (!spell || !partOfSpeech || !meaning || !originalSentence || !usageExplanation || !sentiment || !deodorizedMeaning) {
    throw new Error("AI 返回的 JSON 字段不完整，请重试。必须包含单词、词性、极简释义、原文、记忆/词根、态度、去味。");
  }

  return {
    spell,
    partOfSpeech,
    meaning,
    originalSentence,
    usageExplanation,
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

export function parseWordDraft(input: unknown, context: Pick<RecordDraft, "year" | "sourceTextId">): RecordDraft {
  const payload = parseJsonObject(input);
  const normalized = assertWordDraftPayload(payload);

  return {
    ...normalized,
    year: context.year,
    sourceTextId: context.sourceTextId,
  };
}

export function parseMeaningJudgement(input: unknown) {
  return assertMeaningJudgementPayload(parseJsonObject(input));
}
