import type { AiWordDraftPayload } from "@/types/ai";
import { DEFAULT_AI_BASE_URL, DEFAULT_AI_MODEL_NAME } from "@/lib/utils/constants";

const ANALYZER_SYSTEM_PROMPT = [
  "你现在是顶尖的【考研英语命题人兼词汇教练】。目标不是只解释这篇文章，而是帮用户积累能迁移到整个考研阅读中的单词理解。",
  "严格返回以下 JSON 格式，绝不能有 markdown 包装或废话：",
  "{",
  '  "spell": "目标单词原样返回",',
  '  "partOfSpeech": "当前语境下唯一正确的词性缩写，如 n./v./adj./adv.",',
  '  "meaning": "给 2 个最核心、最通用、最适合长期记忆的中文义项，用中文逗号隔开，如 昭示物，线索",',
  '  "confusingMeaning1": "最容易混淆但在本文不成立的义项1",',
  '  "confusingMeaning2": "最容易混淆但在本文不成立的义项2",',
  '  "confusingMeaning3": "最容易混淆但在本文不成立的义项3",',
  '  "originalSentence": "正文中包含目标词的最短可辨识语境片段；必须逐字来自正文，尽量短，不要整句长摘录",',
  '  "usageExplanation": "记忆/词根拆解，只写 1 句，优先词根、构词、联想，短、准、好记",',
  '  "sentiment": "只能是 [正+]、[负-]、[中性] 三者之一",',
  '  "deodorizedMeaning": "第一行写中国话通俗解释；第二行写考研里通常怎么考/常见误判点；总共最多两行"',
  "}",
  "你会收到：目标单词、考研年份、文章来源编号、该篇阅读正文。你必须先基于正文判断真实用法，再把结果收敛成适合整个考研复习迁移的词卡。",
  "禁止脱离上下文乱编，禁止编造正文里没有的句子，禁止输出空泛套话。",
  "字段要求：",
  "1. spell：保持目标单词原样。",
  "2. partOfSpeech：必须是当前语境下唯一正确的词性缩写。",
  "3. meaning：优先给两个最常用、最通用的中文义项，控制在很短的长度内，不要写成长句，不要堆很多义项。",
  "4. confusingMeaning1/2/3：必须写三个高相似度干扰义项，要像考研命题干扰项。",
  "5. originalSentence：只返回最短可辨识语境，必须逐字来自提供正文；优先短语或局部片段，除非再短就会失真，否则不要整句照抄。",
  "6. usageExplanation：不是普通释义，只保留一条最有记忆点的词根/构词/联想提示。",
  "7. sentiment：只能输出 [正+]、[负-]、[中性]。",
  "8. deodorizedMeaning：必须分成两层——第一层是白话解释，第二层是考研里通常怎么考/常见误判点；不要写成长段。",
  "9. 所有字段必须返回，不得缺失，不得增加无关字段。",
  "10. 只能输出 JSON 本体，不要 markdown，不要代码块，不要解释。",
].join("\n");

export function buildWordGenerationPrompt(params: {
  spell: string;
  year: string;
  sourceTextId: string;
  sourceText: string;
}) {
  return [
    "请基于以下真题正文生成单词卡。",
    "输出目标：帮助用户记住这个词在考研里最常见、最值得迁移的理解，而不是只解释这篇文章。",
    "分析重点：",
    "1. 先在正文中准确定位目标单词所在语境。",
    "2. 判断它在本文这一句里的唯一正确词性。",
    "3. meaning 给两个极简中文义项，越短越好，用中文逗号隔开。",
    "4. 给出三个高相似度、但在本文不成立的易混淆义项。",
    "5. usageExplanation 只写一条记忆/词根提示，不要展开成段。",
    "6. sentiment 只能输出 [正+]、[负-]、[中性]。",
    "7. deodorizedMeaning 必须写两层：第一行是中国话白话解释，第二行是考研一般怎么考它/常见误判点。",
    "8. originalSentence 不要整句长摘录，只保留最短、仍能识别真实用法的语境片段；只有再短就失真时才保留整句。",
    "不要写空话，不要写“表示某种含义”“起修饰作用”这种废话。",
    "不要输出过长内容，每个字段都尽量压缩到卡片友好的长度。",
    `目标单词：${params.spell}`,
    `考研年份：${params.year}`,
    `文章来源：${params.sourceTextId}`,
    "正文开始",
    params.sourceText,
    "正文结束",
  ].join("\n");
}

function resolveAiConfig(baseUrl: string, modelName: string) {
  return {
    baseUrl: baseUrl.trim() || DEFAULT_AI_BASE_URL,
    modelName: modelName.trim() || DEFAULT_AI_MODEL_NAME,
  };
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
        max_tokens: 1800,
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
  const resolved = resolveAiConfig(params.baseUrl, params.modelName);
  const endpoint = normalizeBaseUrl(resolved.baseUrl, resolved.modelName);
  const response = await fetch(
    endpoint,
    buildRequestInit({
      ...params,
      modelName: resolved.modelName,
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
