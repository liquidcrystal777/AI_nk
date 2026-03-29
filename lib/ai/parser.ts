import { normalizeSentenceArray } from "@/lib/utils/text";
import type { RecordDraft } from "@/types/db";

function extractJsonString(input: string) {
  const match = input.match(/\{[\s\S]*\}/);
  return match?.[0] ?? input;
}

function assertWordDraftPayload(payload: Record<string, unknown>) {
  const spell = String(payload.spell ?? "").trim();
  const pronunciation = String(payload.pronunciation ?? "").trim();
  const meaning = String(payload.meaning ?? "").trim();
  const originalSentence = normalizeSentenceArray(payload.originalSentence);

  if (!spell || !pronunciation || !meaning || originalSentence.length === 0) {
    throw new Error("AI 返回的 JSON 字段不完整，请重试或调整提示词。");
  }

  return {
    spell,
    pronunciation,
    meaning,
    originalSentence,
  };
}

export function parseWordDraft(input: unknown, context: Pick<RecordDraft, "prompt" | "year" | "sourceTextId">): RecordDraft {
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
    prompt: context.prompt,
    year: context.year,
    sourceTextId: context.sourceTextId,
  };
}
