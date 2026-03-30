import {
  formatWordSpell,
  normalizeCompactChineseList,
  normalizeMultilineTextWithLimit,
  normalizeSingleLineText,
  takeFirstLine,
} from "@/lib/utils/text";
import type { RecordDraft } from "@/types/db";

function extractJsonString(input: string) {
  const match = input.match(/\{[\s\S]*\}/);
  return match?.[0] ?? input;
}

function assertWordDraftPayload(payload: Record<string, unknown>) {
  const spell = formatWordSpell(payload.spell);
  const partOfSpeech = normalizeSingleLineText(payload.partOfSpeech);
  const meaning = normalizeCompactChineseList(payload.meaning);
  const confusingMeaning1 = normalizeSingleLineText(payload.confusingMeaning1);
  const confusingMeaning2 = normalizeSingleLineText(payload.confusingMeaning2);
  const confusingMeaning3 = normalizeSingleLineText(payload.confusingMeaning3);
  const originalSentence = takeFirstLine(payload.originalSentence);
  const usageExplanation = takeFirstLine(payload.usageExplanation);
  const sentiment = normalizeSingleLineText(payload.sentiment);
  const deodorizedMeaning = normalizeMultilineTextWithLimit(payload.deodorizedMeaning, 2);

  if (
    !spell ||
    !partOfSpeech ||
    !meaning ||
    !confusingMeaning1 ||
    !confusingMeaning2 ||
    !confusingMeaning3 ||
    !originalSentence ||
    !usageExplanation ||
    !sentiment ||
    !deodorizedMeaning
  ) {
    throw new Error("AI 返回的 JSON 字段不完整，请重试。必须包含单词、词性、极简释义、三个易混淆含义、原文、记忆/词根、态度、去味。");
  }

  return {
    spell,
    partOfSpeech,
    meaning,
    confusingMeaning1,
    confusingMeaning2,
    confusingMeaning3,
    originalSentence,
    usageExplanation,
    sentiment,
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
