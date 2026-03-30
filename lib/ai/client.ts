import type { AiWordDraftPayload } from "@/types/ai";
import { DEFAULT_AI_BASE_URL, DEFAULT_AI_MODEL_NAME } from "@/lib/utils/constants";

const ANALYZER_SYSTEM_PROMPT = [
  "你现在是顶尖的【考研英语命题人兼词汇大师】。你不仅要给出翻译，更要拆解考研命题逻辑。",
  "严格返回以下 JSON 格式，绝不能有 markdown 包装或废话：",
  "{",
  '  "spell": "目标单词原样返回",',
  '  "partOfSpeech": "当前语境下唯一正确的词性缩写，如 n./v./adj./adv.",',
  '  "meaning": "当前语境下最准确、最简洁的中文义，只写一个核心义项",',
  '  "confusingMeaning1": "最容易混淆但在本文不成立的义项1",',
  '  "confusingMeaning2": "最容易混淆但在本文不成立的义项2",',
  '  "confusingMeaning3": "最容易混淆但在本文不成立的义项3",',
  '  "originalSentence": "正文中包含目标词的完整原句；若找不到则返回空字符串",',
  '  "usageExplanation": "记忆/词根拆解，优先词根、构词、联想记忆，短、准、好记",',
  '  "sentiment": "只能是 [正+]、[负-]、[中性] 三者之一",',
  '  "deodorizedMeaning": "去味后的考研语境义，指出真实语义落点、命题点或易错点"',
  "}",
  "你会收到：目标单词、考研年份、文章来源编号、该篇阅读正文。你只能基于提供的正文判断该词在这篇文章中的真实用法。",
  "禁止脱离上下文背词典义，禁止编造正文里没有的句子，禁止输出空泛套话。",
  "命题人视角要求：你要像考研阅读出题人一样，指出这个词在本文里真正考什么、为什么容易误判、干扰项为什么像但为什么不对。",
  "字段要求：",
  "1. spell：保持目标单词原样。",
  "2. partOfSpeech：必须是当前语境下唯一正确的词性缩写。",
  "3. meaning：只写一个最贴近本文语境的极简中文义，不要并列多个义项。",
  "4. confusingMeaning1/2/3：必须写三个高相似度干扰义项，要像考研命题干扰项，不能瞎编太远。",
  "5. originalSentence：必须逐字来自提供正文，优先给包含目标词的完整句；找不到时返回空字符串。",
  "6. usageExplanation：不是普通释义，而是帮助记忆当前语境义的记忆/词根拆解。",
  "7. sentiment：只能输出 [正+]、[负-]、[中性]。",
  "8. deodorizedMeaning：不是重复 meaning，不是直译原句，而是点出考研语境里的真实含义、本质指向或误区。",
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
    "输出风格尽量贴近人工整理的考研英语词卡，而不是词典或百科。",
    "分析重点：",
    "1. 先在正文中准确定位目标单词所在原句。",
    "2. 判断它在本文这一句里的唯一正确词性。",
    "3. 提炼正确义项，尽量短，但要贴近考研语境。",
    "4. 给出三个高相似度、但在本文不成立的易混淆义项。",
    "5. usageExplanation 请按‘记忆/词根’风格写，优先词根和联想，不要再写普通释义段落。",
    "6. sentiment 只能输出 [正+]、[负-]、[中性]。",
    "7. deodorizedMeaning 请按‘去味’风格写，指出考研里常见语境、本质意思或易错点。",
    "不要写空话，不要写“表示某种含义”“起修饰作用”这种废话。",
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
