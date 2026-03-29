import type { AiWordDraftPayload } from "@/types/ai";

export function buildWordGenerationPrompt(params: {
  prompt: string;
  year: string;
  sourceTextId: string;
}) {
  return [
    "你是一个考研英语单词卡片生成器。",
    "请严格只返回 JSON，不要返回 Markdown 代码块，不要解释。",
    "字段要求：spell, pronunciation, meaning, originalSentence。",
    "其中 originalSentence 必须是字符串数组。",
    `考研年份：${params.year}`,
    `文章来源：${params.sourceTextId}`,
    `用户提示词：${params.prompt}`,
  ].join("\n");
}

export async function generateWordDraft(params: {
  apiKey: string;
  baseUrl: string;
  modelName: string;
  prompt: string;
  year: string;
  sourceTextId: string;
}): Promise<AiWordDraftPayload> {
  const response = await fetch(params.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.modelName,
      messages: [
        {
          role: "user",
          content: buildWordGenerationPrompt({
            prompt: params.prompt,
            year: params.year,
            sourceTextId: params.sourceTextId,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI 接口调用失败：${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content ?? data?.content?.[0]?.text ?? data;

  if (typeof content === "string") {
    return { raw: content } as AiWordDraftPayload & { raw: string };
  }

  if (typeof content === "object" && content) {
    return content as AiWordDraftPayload;
  }

  return data as AiWordDraftPayload;
}
