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

export function normalizeMultilineTextWithLimit(input: unknown, maxLines = 2) {
  return normalizeMultilineText(input)
    .split("\n")
    .filter(Boolean)
    .slice(0, maxLines)
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

export function formatDisplayYear(input: unknown) {
  const normalized = normalizeSingleLineText(input);
  if (!normalized) {
    return "";
  }

  return /^\d{4}$/.test(normalized) ? `${normalized}年` : normalized;
}

export function formatSourceTextLabel(input: unknown) {
  return normalizeSingleLineText(input).replace(/^Text/i, "TEXT");
}

/**
 * 清理熟词僻义分析内容中可能存在的重复引导语
 * 如 "考研中如何识别该僻义出场：xxx" -> "xxx"
 */
export function cleanRareMeaningAnalysisPrefix(input: unknown) {
  const normalized = normalizeMultilineText(input);
  if (!normalized) {
    return "";
  }

  const lines = normalized.split("\n");
  const prefixesToRemove = [
    "考研中如何识别该僻义出场",
    "考研中如何识别该僻义出场：",
    "考研中如何识别该僻义出场:",
    "如何识别该僻义出场",
    "如何识别该僻义出场：",
    "如何识别该僻义出场:",
    "识别该僻义出场",
    "识别该僻义出场：",
    "识别该僻义出场:",
  ];

  // 处理第二行（识别方法）
  if (lines.length >= 2) {
    let secondLine = lines[1];
    for (const prefix of prefixesToRemove) {
      if (secondLine.startsWith(prefix)) {
        secondLine = secondLine.slice(prefix.length).trim();
        // 去掉可能残留的冒号
        secondLine = secondLine.replace(/^[:：]/, "").trim();
        break;
      }
    }
    lines[1] = secondLine;
  }

  return lines.join("\n");
}

/**
 * 词性标准化映射表
 * 将各种变体统一为标准缩写格式
 */
const PART_OF_SPEECH_MAP: Record<string, string> = {
  // 名词变体
  "名词": "n.",
  "n": "n.",
  "N": "n.",
  "名词性": "n.",
  // 动词变体
  "动词": "v.",
  "v": "v.",
  "V": "v.",
  "动词性": "v.",
  // 形容词变体
  "形容词": "adj.",
  "adj": "adj.",
  "Adj": "adj.",
  "ADJ": "adj.",
  "a": "adj.",
  "A": "adj.",
  // 副词变体
  "副词": "adv.",
  "adv": "adv.",
  "Adv": "adv.",
  "ADV": "adv.",
  "ad": "adv.",
  "Ad": "adv.",
  // 连词变体
  "连词": "conj.",
  "conj": "conj.",
  "Conj": "conj.",
  // 介词变体
  "介词": "prep.",
  "prep": "prep.",
  "Prep": "prep.",
  // 代词变体
  "代词": "pron.",
  "pron": "pron.",
  "Pron": "pron.",
  // 词组变体
  "词组": "phr.",
  "短语": "phr.",
  "phr": "phr.",
  "Phr": "phr.",
  "phrase": "phr.",
  "Phrase": "phr.",
  "动词词组": "v.phr.",
  "名词词组": "n.phr.",
  "形容词词组": "adj.phr.",
};

/**
 * 标准化词性格式
 * 将各种变体统一为标准缩写（如 n./v./adj./adv.）
 */
export function normalizePartOfSpeech(input: unknown): string {
  const raw = normalizeSingleLineText(input);
  if (!raw) {
    return "";
  }

  // 直接匹配映射表
  const mapped = PART_OF_SPEECH_MAP[raw];
  if (mapped) {
    return mapped;
  }

  // 处理带点的格式（如 "n." 已经是标准格式）
  if (/^[a-z]+\.$/i.test(raw)) {
    return raw.toLowerCase();
  }

  // 处理组合词性（如 "n./v."）
  if (raw.includes("/") || raw.includes("、")) {
    const parts = raw.split(/[\/、]/).map((p) => {
      const trimmed = p.trim();
      return PART_OF_SPEECH_MAP[trimmed] || trimmed;
    });
    return parts.join("/");
  }

  // 如果都不匹配，返回原始值但确保有小写格式
  return raw.toLowerCase();
}
