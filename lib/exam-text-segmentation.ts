function normalizeWhitespace(input: string) {
  return input
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildHeadingPattern(index: number) {
  return new RegExp(`(?:^|\\n)\\s*Text\\s*${index}\\b`, "ig");
}

function findHeadingStart(text: string, index: number) {
  const pattern = buildHeadingPattern(index);
  const match = pattern.exec(text);
  return match?.index ?? -1;
}

export function extractSourceTextFromPaper(fullText: string, sourceTextId: string) {
  const normalizedText = normalizeWhitespace(fullText);
  const match = sourceTextId.trim().match(/^Text\s*([1-4])$/i);

  if (!match) {
    throw new Error("文章来源仅支持 Text1 到 Text4");
  }

  const textNumber = Number(match[1]);
  const startIndex = findHeadingStart(normalizedText, textNumber);

  if (startIndex < 0) {
    throw new Error(`无法在 PDF 中定位 ${sourceTextId}，请检查该年份 PDF 的文字结构`);
  }

  let endIndex = normalizedText.length;
  for (let next = textNumber + 1; next <= 4; next += 1) {
    const nextIndex = findHeadingStart(normalizedText, next);
    if (nextIndex > startIndex) {
      endIndex = nextIndex;
      break;
    }
  }

  const section = normalizedText.slice(startIndex, endIndex).trim();
  if (!section) {
    throw new Error(`已定位 ${sourceTextId}，但切分后的正文为空`);
  }

  return section;
}
