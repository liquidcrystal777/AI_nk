import type { AiWordDraftPayload } from "@/types/ai";

const ANALYZER_SYSTEM_PROMPT = [
  "你现在的角色是考研英语真题单词卡生成器。",
  "你会收到一个目标单词、考研年份、文章来源编号，以及该篇阅读正文。",
  "你只能基于提供的正文判断该单词在该篇文章中的真实用法。",
  "你只能返回 JSON，不要返回 Markdown 代码块，不要补充解释，不要输出多余文本。",
  'JSON 必须严格包含五个字段：spell、meaning、originalSentence、usageExplanation、deodorizedMeaning。',
  '字段格式必须如下：{"spell":"Reminder","meaning":"提醒","originalSentence":"原文中的完整句子","usageExplanation":"该词在这句中的准确中文释义与作用","deodorizedMeaning":"去掉修辞和语气后的朴素表达"}',
  "要求：meaning 只能写极简中文释义；originalSentence 必须逐字来自提供正文；不得返回音标；不得返回英文释义；不得缺字段。",
].join("\n");

export function buildWordGenerationPrompt(params: {
  spell: string;
  year: string;
  sourceTextId: string;
  sourceText: string;
}) {
  return [
    "请基于以下真题正文生成单词卡。",
    `目标单词：${params.spell}`,
    `考研年份：${params.year}`,
    `文章来源：${params.sourceTextId}`,
    "正文开始",
    params.sourceText,
    "正文结束",
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
  spell: string;
  year: string;
  sourceTextId: string;
  sourceText: string;
}): RequestInit {
  const prompt = buildWordGenerationPrompt({
    spell: params.spell,
    year: params.year,
    sourceTextId: params.sourceTextId,
    sourceText: params.sourceText,
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
        max_tokens: 1600,
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
  spell: string;
  year: string;
  sourceTextId: string;
  sourceText: string;
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
