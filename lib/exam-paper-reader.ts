import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";

const PDF_WORKER_SRC = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url,
).toString();

let workerConfigured = false;

function ensureWorker() {
  if (!workerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
    workerConfigured = true;
  }
}

function normalizePdfText(input: string) {
  return input
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function readExamPaperText(year: string) {
  const normalizedYear = year.trim();

  if (!normalizedYear) {
    throw new Error("请选择考研年份后再生成卡片");
  }

  ensureWorker();

  const response = await fetch(`/exam-papers/${normalizedYear}.pdf`);
  if (!response.ok) {
    throw new Error(`未找到 ${normalizedYear} 年真题 PDF，请检查 public/exam-papers/${normalizedYear}.pdf`);
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

  return normalizePdfText(pageTexts.join("\n\n"));
}
