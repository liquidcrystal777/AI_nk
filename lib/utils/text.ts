export function normalizeSentenceArray(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
}

export function normalizeSingleLineText(input: unknown) {
  return String(input ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeMultilineText(input: unknown) {
  return String(input ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

export function safeTrim(value: string) {
  return value.trim();
}
