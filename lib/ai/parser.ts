import { normalizeMultilineText, normalizeSingleLineText } from "@/lib/utils/text";
import type { RecordDraft } from "@/types/db";

function extractJsonString(input: string) {
  const match = input.match(/\{[\s\S]*\}/);
  return match?.[0] ?? input;
}

function assertWordDraftPayload(payload: Record<string, unknown>) {
  const spell = normalizeSingleLineText(payload.spell);
  const meaning = normalizeSingleLineText(payload.meaning);
  const originalSentence = normalizeMultilineText(payload.originalSentence);
  const usageExplanation = normalizeMultilineText(payload.usageExplanation);
  const deodorizedMeaning = normalizeMultilineText(payload.deodorizedMeaning);

  if (!spell || !meaning || !originalSentence || !usageExplanation || !deodorizedMeaning) {
    throw new Error("AI 返回的 JSON 字段不完整，请重试。必须包含单词、极简释义、原句、释义、去味。 ");
  }

  return {
    spell,
    meaning,
    originalSentence,
    usageExplanation,
    deodorizedMeaning,
  };
}

export function parseWordDraft(input: unknown, context: Pick<RecordDraft, "year" | "sourceTextId">): RecordDraft {
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
      return parseWordDraft(payload.raw, context);
    }
  } else {
    throw new Error("AI 返回内容为空，请重试。");
  }

  const normalized = assertWordDraftPayload(payload);

  return {
    ...normalized,
    year: context.year,
    sourceTextId: context.sourceTextId,
  };
}
