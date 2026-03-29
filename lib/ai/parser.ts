import { normalizeSentenceArray } from "@/lib/utils/text";
import type { RecordDraft } from "@/types/db";

function extractJsonString(input: string) {
  const match = input.match(/\{[\s\S]*\}/);
  return match?.[0] ?? input;
}

export function parseWordDraft(input: unknown, context: Pick<RecordDraft, "prompt" | "year" | "sourceTextId">): RecordDraft {
  let payload: Record<string, unknown> = {};

  if (typeof input === "string") {
    const jsonString = extractJsonString(input);
    try {
      payload = JSON.parse(jsonString) as Record<string, unknown>;
    } catch {
      payload = {};
    }
  } else if (typeof input === "object" && input) {
    payload = input as Record<string, unknown>;

    if (typeof payload.raw === "string") {
      return parseWordDraft(payload.raw, context);
    }
  }

  return {
    spell: String(payload.spell ?? "").trim(),
    pronunciation: String(payload.pronunciation ?? "").trim(),
    meaning: String(payload.meaning ?? "").trim(),
    originalSentence: normalizeSentenceArray(payload.originalSentence),
    prompt: context.prompt,
    year: context.year,
    sourceTextId: context.sourceTextId,
  };
}
