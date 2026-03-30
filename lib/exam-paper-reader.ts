function normalizeExamText(input: string) {
  return input
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const SUPPORTED_EXAM_PAPER_YEARS = Array.from({ length: 26 }, (_, index) => String(1998 + index));

function stripLatexCommands(input: string) {
  return input
    .replace(/%.*$/gm, "")
    .replace(/\\\\/g, "\n")
    .replace(/\\(bta|TiGanSpace|newpage)\b/g, "\n")
    .replace(/\\(section|subsection|textbf|emph)\{([^}]*)\}/g, "$2")
    .replace(/\\(begin|end)\{[^}]*\}(\[[^\]]*\])?/g, "\n")
    .replace(/\\(item|fourchoices|lineread)\b/g, "\n")
    .replace(/\\[a-zA-Z]+(\[[^\]]*\])?(\{[^}]*\})?/g, " ")
    .replace(/[{}]/g, " ");
}

async function readTextFile(path: string) {
  const response = await fetch(path);
  if (!response.ok) {
    return null;
  }

  return response.text();
}

async function readTexExamPaperText(year: string) {
  const texText = await readTextFile(`/exam-papers/${year}.tex`);
  if (!texText) {
    return null;
  }

  return normalizeExamText(stripLatexCommands(texText));
}

async function readPdfExamPaperText(year: string) {
  const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");

  const workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  const response = await fetch(`/exam-papers/${year}.pdf`);
  if (!response.ok) {
    return null;
  }

  const pdfData = await response.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const items = textContent.items.map((item) => {
      return "str" in item ? item.str : "";
    });

    pageTexts.push(items.join(" "));
  }

  return normalizeExamText(pageTexts.join("\n\n"));
}

export async function readExamPaperText(year: string) {
  const normalizedYear = year.trim();

  if (!normalizedYear) {
    throw new Error("请选择考研年份后再生成卡片");
  }

  const texText = await readTexExamPaperText(normalizedYear);
  if (texText) {
    return texText;
  }

  const pdfText = await readPdfExamPaperText(normalizedYear);
  if (pdfText) {
    return pdfText;
  }

  const supportedYearHint = `${SUPPORTED_EXAM_PAPER_YEARS[0]}-${SUPPORTED_EXAM_PAPER_YEARS.at(-1)}`;
  throw new Error(
    `未找到 ${normalizedYear} 年真题源文件。当前内置题库仅覆盖 ${supportedYearHint}；${normalizedYear} 年既没有 tex，也没有 pdf，可补充 public/exam-papers/${normalizedYear}.tex 或 ${normalizedYear}.pdf。`,
  );
}
