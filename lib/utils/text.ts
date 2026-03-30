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

export function formatWordSpell(input: unknown) {
  const normalized = normalizeSingleLineText(input);
  if (!normalized || !/^[a-z]+$/i.test(normalized)) {
    return normalized;
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

export function takeFirstLine(input: unknown) {
  return normalizeMultilineText(input).split("\n")[0] ?? "";
}

export function normalizeCompactChineseList(input: unknown, limit = 2) {
  const normalized = normalizeSingleLineText(input);
  if (!normalized) {
    return "";
  }

  const parts = normalized
    .split(/[，,、\/；;｜|]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (parts.length ? parts : [normalized]).slice(0, limit).join("，");
}

export function formatSourceTextLabel(input: unknown) {
  return normalizeSingleLineText(input).replace(/^Text/i, "TEXT");
}
