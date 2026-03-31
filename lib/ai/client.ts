import type { AiMeaningJudgementPayload, AiWordDraftPayload } from "@/types/ai";
import { DEFAULT_AI_BASE_URL, DEFAULT_AI_MODEL_NAME } from "@/lib/utils/constants";

const ANALYZER_SYSTEM_PROMPT = [
  "你现在是顶尖的【考研英语命题人】兼【高密度词汇卡片设计师】。",
  "你的任务是基于用户提供的目标单词与正文语境，生成适合手机端展示的极度紧凑、直击考点、带学术气息的单词解析卡片。",
  "你的目标不是写百科解释，而是准确判断该词在当前语境中的唯一正确用法，并提炼最值得考研迁移记忆的核心义项。",
  "必须严格返回以下 JSON 对象，绝不能有 markdown 包装或任何额外说明：",
  "{",
  '  "spell": "目标单词原样返回",',
  '  "partOfSpeech": "当前语境下唯一正确的词性缩写，如 n./v./adj./adv.",',
  '  "meaning": "给 2 个最核心、最通用、最适合长期记忆的中文义项，用中文逗号隔开",',
  '  "originalSentence": "正文中包含目标词的最短可辨识语境片段；必须逐字来自正文，首尾带省略号",',
  '  "usageExplanation": "记忆/词根/联想抓手，只写 1 句，短、狠、有画面",',
  '  "sentiment": "只能是 [正+]、[负-]、[中性] 三者之一",',
  '  "deodorizedMeaning": "第一行写中国话白话解释；第二行写考研里通常怎么考/常见误判点；总共最多两行"',
  "}",
  "总原则：所有分析必须优先服从正文语境，不允许脱离上下文乱推义项，不允许编造正文里没有的句子或信息。",
  "必须服务考研阅读迁移：不是只解释这一句，而是提炼这个词在考研阅读中最常见、最有价值的理解方式。",
  "必须适合手机卡片展示：输出要短，不要长句，不要大段解释，不要套话。",
  "学术感来自精准、凝练、像命题人视角，不来自堆术语或装腔作势。",
  "记忆/词根逻辑必须有抓手和画面感：优先词根、词缀、构词拆解；如果不自然，可用高质量联想；禁止写成词典式解释。",
  "去味/考研逻辑是核心：deodorizedMeaning 第二行必须点出这个词在考研阅读里通常怎么考、常见误判点、或在文中的论证角色。",
  "态度倾向必须依据当前正文语境判断，不要按词典默认感情色彩机械判断。",
  "原句裁剪必须像物理剪刀一样：只能逐字摘取原文中的最小核心意群，绝对不能改写。",
  "字段要求：",
  "1. spell：保持目标单词原样，不得变形。",
  "2. partOfSpeech：必须是当前语境下唯一正确的词性缩写，不要写多个词性。",
  "3. meaning：优先给两个最常用、最通用的中文义项，控制在很短的长度内，不要写成长句，不要堆很多义项。",
  "4. originalSentence：只返回最短可辨识语境，必须逐字来自提供正文，首尾都带省略号；除非再短就失真，否则不要整句照抄。",
  "5. usageExplanation：不是普通释义，只保留一条最有记忆点的词根/构词/联想提示。",
  "6. sentiment：只能输出 [正+]、[负-]、[中性]。",
  "7. deodorizedMeaning：必须严格两行，第一行白话解释，第二行点出考研常见考法/误判点/语篇角色。",
  "8. 所有字段必须返回，不得缺失，不得增加无关字段。",
  "禁止事项：禁止输出 Markdown、代码块、JSON 之外的解释；禁止输出 null；禁止写‘可能是’‘通常可理解为’等模糊措辞；禁止套话。",
  "你只能输出 JSON 本体，不要 markdown，不要代码块，不要解释。",
].join("\n");

const MEANING_JUDGE_SYSTEM_PROMPT = [
  "你是严格但宽容的考研英语词义判题器。",
  "任务：判断用户输入的中文释义，是否表达了目标单词的核心含义。",
  "判题原则：",
  "1. 只看语义是否抓住核心，不要求和标准答案字面一致。",
  "2. 近义表达、白话表达、概括表达都可以判对。",
  "3. 如果用户答案明显偏离核心义项、答成反义、或混成无关义项，判错。",
  "4. 不要因为措辞不专业就判错。",
  "5. 只输出 JSON，不要输出 markdown 或解释性前后缀。",
  "严格返回：",
  "{",
  '  "verdict": "correct 或 incorrect",',
  '  "confidence": 0 到 1 之间的小数,',
  '  "reason": "一句中文理由，短而明确",',
  '  "acceptedAnswer": "可接受的核心中文答案，简短"',
  "}",
].join("\n");

export function buildWordGenerationPrompt(params: {
  spell: string;
  year: string;
  sourceTextId: string;
  sourceText: string;
}) {
  return [
    `目标单词：${params.spell}`,
    `考研年份：${params.year}`,
    `文章来源：${params.sourceTextId}`,
    "正文开始",
    params.sourceText,
    "正文结束",
  ].join("\n");
}

function buildMeaningJudgePrompt(params: {
  spell: string;
  meaning: string;
  deodorizedMeaning: string;
  usageExplanation: string;
  userAnswer: string;
}) {
  return [
    "请判断用户对单词词义的理解是否正确。",
    `目标单词：${params.spell}`,
    `标准极简释义：${params.meaning}`,
    `补充白话解释：${params.deodorizedMeaning || "无"}`,
    `记忆提示：${params.usageExplanation || "无"}`,
    `用户答案：${params.userAnswer}`,
    "如果用户表达抓住核心含义，就判 correct。",
    "如果用户明显答偏、答反、或答成无关义项，就判 incorrect。",
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

function buildJsonRequestInit(params: {
  apiKey: string;
  endpoint: string;
  modelName: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}): RequestInit {
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
        system: params.systemPrompt,
        max_tokens: params.maxTokens ?? 1800,
        messages: [
          {
            role: "user",
            content: params.userPrompt,
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
          content: params.systemPrompt,
        },
        {
          role: "user",
          content: params.userPrompt,
        },
      ],
    }),
  };
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

  return buildJsonRequestInit({
    apiKey: params.apiKey,
    endpoint: params.endpoint,
    modelName: params.modelName,
    systemPrompt: ANALYZER_SYSTEM_PROMPT,
    userPrompt: prompt,
    maxTokens: 1800,
  });
}

function extractTextContent(data: unknown) {
  const payload = data as {
    choices?: Array<{ message?: { content?: string } }>;
    content?: Array<{ text?: string }>;
  };

  return payload?.choices?.[0]?.message?.content ?? payload?.content?.[0]?.text ?? data;
}

async function requestJsonPayload<T>(params: {
  apiKey: string;
  baseUrl: string;
  modelName: string;
  buildInit: (resolved: { endpoint: string; modelName: string }) => RequestInit;
}): Promise<T> {
  const resolved = resolveAiConfig(params.baseUrl, params.modelName);
  const endpoint = normalizeBaseUrl(resolved.baseUrl, resolved.modelName);
  const response = await fetch(endpoint, params.buildInit({ endpoint, modelName: resolved.modelName }));

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
      return JSON.parse(content) as T;
    } catch {
      throw new Error("AI 返回内容不是合法 JSON，请调整提示词或检查模型是否支持 JSON 输出。");
    }
  }

  if (typeof content === "object" && content) {
    return content as T;
  }

  return data as T;
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
  return requestJsonPayload<AiWordDraftPayload>({
    apiKey: params.apiKey,
    baseUrl: params.baseUrl,
    modelName: params.modelName,
    buildInit: ({ endpoint, modelName }) =>
      buildRequestInit({
        ...params,
        endpoint,
        modelName,
      }),
  });
}

export async function judgeMeaningAnswer(params: {
  apiKey: string;
  baseUrl: string;
  modelName: string;
  spell: string;
  meaning: string;
  deodorizedMeaning: string;
  usageExplanation: string;
  userAnswer: string;
}): Promise<AiMeaningJudgementPayload> {
  return requestJsonPayload<AiMeaningJudgementPayload>({
    apiKey: params.apiKey,
    baseUrl: params.baseUrl,
    modelName: params.modelName,
    buildInit: ({ endpoint, modelName }) =>
      buildJsonRequestInit({
        apiKey: params.apiKey,
        endpoint,
        modelName,
        systemPrompt: MEANING_JUDGE_SYSTEM_PROMPT,
        userPrompt: buildMeaningJudgePrompt(params),
        maxTokens: 600,
      }),
  });
}
