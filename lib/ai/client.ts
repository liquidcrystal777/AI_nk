import type { AiWordDraftPayload } from "@/types/ai";

const ANALYZER_SYSTEM_PROMPT = [
  "你现在的角色是考研英语语义深度分析器。",
  "你的任务是从用户提供的考研英语上下文里提取生词，并输出可直接写入前端表单的结果。",
  "你只能返回 JSON，不要返回 Markdown 代码块，不要补充解释，不要输出多余文本。",
  'JSON 必须严格包含四个字段：spell、pronunciation、meaning、originalSentence。',
  '字段格式必须如下：{"spell":"提取出的生词首字母大写","pronunciation":"准确音标","meaning":"【态度标签 (+/-)】词性. 精准释义 (附带考研陷阱点拨)","originalSentence":"[原句] 给出考研年份文章原句\\n[记忆] 词根拆解与暴力联想"}',
].join("\n");

export function buildWordGenerationPrompt(params: {
  prompt: string;
  year: string;
  sourceTextId: string;
}) {
  return [
    "请基于以下信息完成分析，并严格按 System Prompt 指定的 JSON 格式输出。",
    `考研年份：${params.year}`,
    `文章来源：${params.sourceTextId}`,
    `用户提示词：${params.prompt}`,
  ].join("\n");
}

function normalizeBaseUrl(baseUrl: string, modelName: string) {
  const trimmed = baseUrl.trim().replace(/\/$/, "");

  if (/\/chat\/completions$/.test(trimmed) || /\/messages$/.test(trimmed)) {
    return trimmed;
  }

  if (/claude/i.test(modelName) || /anthropic/i.test(trimmed)) {
    return `${trimmed}/messages`;
  }

  return `${trimmed}/chat/completions`;
}

function isAnthropicEndpoint(url: string) {
  return /\/messages$/.test(url);
}

function buildRequestInit(params: {
  apiKey: string;
  endpoint: string;
  modelName: string;
  prompt: string;
  year: string;
  sourceTextId: string;
}): RequestInit {
  const prompt = buildWordGenerationPrompt({
    prompt: params.prompt,
    year: params.year,
    sourceTextId: params.sourceTextId,
  });

  if (isAnthropicEndpoint(params.endpoint)) {
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": params.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: params.modelName,
        system: ANALYZER_SYSTEM_PROMPT,
        max_tokens: 1200,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    };
  }

  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.modelName,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: ANALYZER_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  };
}

function extractTextContent(data: unknown) {
  const payload = data as {
    choices?: Array<{ message?: { content?: string } }>;
    content?: Array<{ text?: string }>;
  };

  return payload?.choices?.[0]?.message?.content ?? payload?.content?.[0]?.text ?? data;
}

export async function generateWordDraft(params: {
  apiKey: string;
  baseUrl: string;
  modelName: string;
  prompt: string;
  year: string;
  sourceTextId: string;
}): Promise<AiWordDraftPayload> {
  const endpoint = normalizeBaseUrl(params.baseUrl, params.modelName);
  const response = await fetch(
    endpoint,
    buildRequestInit({
      ...params,
      endpoint,
    }),
  );

  const contentType = response.headers.get("content-type") ?? "";
  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`AI 接口调用失败：${response.status}。${rawText.slice(0, 200)}`);
  }

  if (contentType.includes("text/html") || /^\s*</.test(rawText)) {
    throw new Error(
      `AI 接口返回了 HTML 而不是 JSON。请检查 Base URL 是否填写成了网页地址。当前请求地址：${endpoint}。如果你使用 DeepSeek / OpenAI 兼容接口，建议填写到 /v1 或 /v1/chat/completions；如果你使用 Claude 接口，建议填写到 /v1 或 /v1/messages。`,
    );
  }

  let data: unknown;

  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`AI 接口返回的不是合法 JSON。返回片段：${rawText.slice(0, 200)}`);
  }

  const content = extractTextContent(data);

  if (typeof content === "string") {
    try {
      return JSON.parse(content) as AiWordDraftPayload;
    } catch {
      throw new Error("AI 返回内容不是合法 JSON，请调整提示词或检查模型是否支持 JSON 输出。");
    }
  }

  if (typeof content === "object" && content) {
    return content as AiWordDraftPayload;
  }

  return data as AiWordDraftPayload;
}
