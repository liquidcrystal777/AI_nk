import type { AiComparisonDraftPayload, AiMeaningJudgementPayload, AiPhraseDraftPayload, AiRareMeaningDraftPayload, AiWordDraftPayload } from "@/types/ai";
import { DEFAULT_AI_BASE_URL, DEFAULT_AI_MODEL_NAME } from "@/lib/utils/constants";
import type { CardType, RecordMode } from "@/types/db";

const ANALYZER_SYSTEM_PROMPT = [
  "你现在是顶尖的【考研英语命题人】兼【高密度词汇卡片设计师】。",
  "你的任务是基于用户提供的目标单词与正文语境，生成适合手机端展示的极度紧凑、直击考点、带学术气息的单词解析卡片。",
  "你的目标不是写百科解释，而是在不违背正文的前提下，准确判断该词在当前语境中的唯一正确用法，并提炼最值得考研迁移记忆的高频核心义项、稳定语篇角色和常见考法。",
  "必须严格返回以下 JSON 对象，绝不能有 markdown 包装或任何额外说明：",
  "{",
  '  "spell": "目标单词原样返回",',
  '  "partOfSpeech": "当前语境下唯一正确的词性缩写，如 n./v./adj./adv.",',
  '  "meaning": "给 2 个最核心、最通用、最适合长期记忆的中文义项，用中文逗号隔开",',
  '  "originalSentence": "正文中包含目标词的最短可辨识语境片段；必须逐字来自正文，首尾带省略号；控制在25个单词以内，确保手机卡片显示不超过3行",',
  '  "rootMemory": "词根/词缀/构词拆解记忆，如 naturally = natural(自然的) + -ly(副词后缀)；若无明确词根可写空字符串",',
  '  "associationMemory": "联想记忆/画面记忆，用生动形象的方式帮助记忆；若无合适联想可写空字符串",',
  '  "sentiment": "只能是 [正+]、[负-]、[中性] 三者之一",',
  '  "deodorizedMeaning": "第一行写中国话白话解释；第二行写考研里通常怎么考/常见误判点/语篇角色；总共最多两行"',
  "}",
  "总原则：originalSentence 必须严格服从正文逐字证据；partOfSpeech 必须由当前正文语境唯一确定；meaning、deodorizedMeaning、sentiment 必须在不违背正文的前提下，优先提炼该词在考研阅读中的常见高频义项、稳定语篇角色和常见考法。",
  "正文的作用是排除错误义项、锁定词性、提供原文证据；不是让你被某一句里的局部语气机械牵着走。",
  "必须服务考研阅读迁移：不是只解释这一句，而是提炼这个词在考研阅读中最常见、最有价值、最稳定的理解方式。",
  "必须适合手机卡片展示：输出要短，不要长句，不要大段解释，不要套话。",
  "学术感来自精准、凝练、像命题人视角，不来自堆术语或装腔作势。",
  "记忆方式分两类：",
  "1. rootMemory（词根记忆）：优先词根、词缀、构词拆解。如果该词有明确的词根来源，必须填写；若无，可留空。",
  "2. associationMemory（联想记忆）：生动画面、谐音、故事联想。如果词根不明显或不够有效，可用高质量联想辅助记忆。",
  "两个记忆字段可以都填，也可以只填其一，但至少要填一个有价值的记忆抓手。",
  "去味/考研逻辑是核心：deodorizedMeaning 第二行必须优先点出这个词在考研阅读里通常怎么考、常见误判点、或在文中的稳定论证角色，不要机械复述本句情绪。",
  "sentiment 表示该词在考研阅读中的稳定态度倾向，不等于当前句子的表面情绪。",
  "如果该词更常作为中性论证、描述、评价框架、学术陈述角色出现，即使当前局部片段略带正负语气，也优先输出 [中性]。",
  "只有当正文明确显示该词本身承担稳定且直接的褒义或贬义评价时，才输出 [正+] 或 [负-]；拿不准时，一律输出 [中性]。",
  "原句裁剪必须像物理剪刀一样：只能逐字摘取原文中的最小核心意群，绝对不能改写。必须控制在25个单词以内，确保手机卡片显示不超过3行。",
  "字段要求：",
  "1. spell：保持目标单词原样，不得变形。",
  "2. partOfSpeech：必须是当前语境下唯一正确的词性缩写，不要写多个词性。",
  "3. meaning：优先给两个最常用、最通用、最适合考研长期迁移记忆的中文义项，控制在很短的长度内，不要写成长句，不要堆很多义项。",
  "4. originalSentence：只返回最短可辨识语境，必须逐字来自提供正文，首尾都带省略号；控制在25个单词以内，确保手机卡片显示不超过3行；除非再短就失真，否则不要整句照抄。",
  "5. rootMemory：词根/词缀拆解，若无可留空。",
  "6. associationMemory：联想记忆，若无可留空。",
  "7. sentiment：只能输出 [正+]、[负-]、[中性]。",
  "8. deodorizedMeaning：必须严格两行，第一行白话解释，第二行点出考研常见考法/常见误判点/语篇角色；若文中局部有色彩但常考更偏中性，可直接点明。",
  "9. 所有字段必须返回，不得缺失，不得增加无关字段。",
  "禁止事项：禁止输出 Markdown、代码块、JSON 之外的解释；禁止输出 null；禁止写'可能是''通常可理解为'等模糊措辞；禁止套话。",
  "你只能输出 JSON 本体，不要 markdown，不要代码块，不要解释。",
].join("\n");

const GENERAL_ANALYZER_SYSTEM_PROMPT = [
  "你现在是顶尖的【考研英语命题人】兼【高密度词汇卡片设计师】。",
  "你的任务是基于用户提供的目标单词，生成适合手机端展示的极度紧凑、直击考点、带学术气息的单词解析卡片。",
  "这次不是阅读原文模式，所以你不能假装引用某篇真题原句。你要生成一个最符合考研阅读气质、最有代表性的英文句子，帮助用户记住该词常见用法。",
  "必须严格返回以下 JSON 对象，绝不能有 markdown 包装或任何额外说明：",
  "{",
  '  "spell": "目标单词原样返回",',
  '  "partOfSpeech": "该词最常考、最稳定的词性缩写，如 n./v./adj./adv.",',
  '  "meaning": "给 2 个最核心、最通用、最适合长期记忆的中文义项，用中文逗号隔开",',
  '  "representativeSentence": "你生成的一个最有代表性的考研风格英文句子，必须包含目标单词，控制在20个单词以内，确保手机卡片显示不超过3行",',
  '  "rootMemory": "词根/词缀/构词拆解记忆，如 naturally = natural(自然的) + -ly(副词后缀)；若无明确词根可写空字符串",',
  '  "associationMemory": "联想记忆/画面记忆，用生动形象的方式帮助记忆；若无合适联想可写空字符串",',
  '  "sentiment": "只能是 [正+]、[负-]、[中性] 三者之一",',
  '  "deodorizedMeaning": "第一行写中国话白话解释；第二行写考研里通常怎么考/常见误判点/语篇角色；总共最多两行"',
  "}",
  "代表句必须是你生成的，不要伪装成真题原句，不要出现年份、Text 编号或出处说明。",
  "代表句要体现该词在考研阅读里的高频、稳定、可迁移用法，而不是生造冷僻场景。",
  "代表句必须控制在20个单词以内，确保手机卡片显示不超过3行。",
  "必须适合手机卡片展示：输出要短，不要长句，不要大段解释，不要套话。",
  "学术感来自精准、凝练、像命题人视角，不来自堆术语或装腔作势。",
  "记忆方式分两类：",
  "1. rootMemory（词根记忆）：优先词根、词缀、构词拆解。如果该词有明确的词根来源，必须填写；若无，可留空。",
  "2. associationMemory（联想记忆）：生动画面、谐音、故事联想。如果词根不明显或不够有效，可用高质量联想辅助记忆。",
  "两个记忆字段可以都填，也可以只填其一，但至少要填一个有价值的记忆抓手。",
  "去味/考研逻辑是核心：deodorizedMeaning 第二行必须优先点出这个词在考研阅读里通常怎么考、常见误判点、或稳定语篇角色。",
  "sentiment 表示该词在考研阅读中的稳定态度倾向，不等于句子的表面情绪；拿不准时，一律输出 [中性]。",
  "所有字段必须返回，不得缺失，不得增加无关字段。",
  "禁止事项：禁止输出 Markdown、代码块、JSON 之外的解释；禁止输出 null；禁止写'可能是''通常可理解为'等模糊措辞；禁止套话。",
  "你只能输出 JSON 本体，不要 markdown，不要代码块，不要解释。",
].join("\n");

const PHRASE_ANALYZER_SYSTEM_PROMPT = [
  "你现在是顶尖的【考研英语命题人】兼【高密度词组卡片设计师】。",
  "你的任务是基于用户提供的目标词组，生成适合手机端展示的极度紧凑、直击考点的词组解析卡片。",
  "词组特点：拼写可能较长，需要提炼核心搭配逻辑和常见考点。",
  "必须严格返回以下 JSON 对象：",
  "{",
  '  "spell": "目标词组原样返回",',
  '  "partOfSpeech": "词组的功能标签，如 phr./v.phr./n.phr./adj.phr.",',
  '  "meaning": "给 1-2 个最核心的中文释义，简洁",',
  '  "originalSentence": "包含词组的最短可辨识语境，首尾带省略号，控制在20词以内",',
  '  "structureAnalysis": "词组结构拆解，如 take off = take(拿) + off(离开) → 起飞/成功",',
  '  "collocationTrap": "常见搭配陷阱或误用场景，1句话",',
  '  "typicalContext": "该词组典型出现的语境类型，如学术、商务、日常",',
  '  "sentiment": "[正+]/[负-]/[中性]"',
  "}",
  "关键原则：",
  "1. structureAnalysis 是核心：展示组成部分如何协同表达整体含义",
  "2. collocationTrap 要点明常见错误搭配或误用场景",
  "3. originalSentence 要体现词组的典型用法",
  "4. 所有字段必填，输出纯 JSON",
  "禁止输出 Markdown、代码块、JSON 之外的解释。",
].join("\n");

const RARE_MEANING_ANALYZER_SYSTEM_PROMPT = [
  "你现在是顶尖的【考研英语命题人】兼【熟词僻义挖掘专家】。",
  "你的任务是针对用户提供的目标单词，挖掘其在考研阅读中常被忽略但高频出现的僻义。",
  "核心目标：揭示该词的熟义与僻义对比，帮助考生避开理解陷阱。",
  "必须严格返回以下 JSON 对象：",
  "{",
  '  "spell": "目标单词原样返回",',
  '  "partOfSpeech": "僻义对应的词性",',
  '  "meaning": "格式：熟义:xxx; 僻义:xxx，先给出最常见义，再给出僻义",',
  '  "originalSentence": "体现僻义用法的最短语境，首尾带省略号，20词以内",',
  '  "usageExplanation": "僻义的记忆抓手，1句话，如 company熟义公司，僻义同伴(来自 accompany)",',
  '  "sentiment": "[正+]/[负-]/[中性]，基于僻义语境判断",',
  '  "rareMeaningAnalysis": "第一行：这个僻义为什么容易被忽略；第二行：考研中如何识别该僻义出场"',
  "}",
  "关键原则：",
  "1. 必须是真正的熟词僻义，不是多义词罗列",
  "2. 熟义给最常见的一个，僻义给考研高频但考生易忽略的",
  "3. rareMeaningAnalysis 专门分析僻义陷阱",
  "4. 原句必须体现僻义用法，不能是熟义语境",
  "5. 所有字段必填，输出纯 JSON",
  "禁止输出 Markdown、代码块、JSON 之外的解释。",
].join("\n");

const COMPARISON_ANALYZER_SYSTEM_PROMPT = [
  "你现在是顶尖的【考研英语命题人】兼【词汇辨析专家】。",
  "你的任务是针对用户提供的两个易混淆单词，生成对比记忆卡片。",
  "目标：清晰展示两词的核心差异，帮助考生在阅读中快速识别。",
  "必须严格返回以下 JSON 对象：",
  "{",
  '  "wordA": {',
  '    "spell": "单词A",',
  '    "partOfSpeech": "词性",',
  '    "meaning": "核心释义",',
  '    "usageExplanation": "记忆抓手",',
  '    "keyDifference": "该词的独特之处"',
  '  },',
  '  "wordB": {',
  '    "spell": "单词B",',
  '    "partOfSpeech": "词性",',
  '    "meaning": "核心释义",',
  '    "usageExplanation": "记忆抓手",',
  '    "keyDifference": "该词的独特之处"',
  '  },',
  '  "commonContext": "两词共同出现的典型场景或易混语境",',
  '  "contrastSummary": "一句话辨析总结：A用于..., B用于..., 核心差异是..."',
  "}",
  "关键原则：",
  "1. keyDifference 必须是该词区别于另一词的核心特征",
  "2. commonContext 要体现两词易混淆的实际场景",
  "3. contrastSummary 是辨析的核心，要简洁有力",
  "4. 两词的释义要精准，不能笼统",
  "5. 所有字段必填，输出纯 JSON",
  "禁止输出 Markdown、代码块、JSON 之外的解释。",
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
    "补充提示：文章来源中的 Text1~Text4 仅表示该年份阅读中的第 1~4 篇编号，不是文章标题。你必须只依据下方提供的正文判断词义和用法；如果正文无法支撑判断，不要编造正文外信息。",
    "正文开始",
    params.sourceText,
    "正文结束",
  ].join("\n");
}

function buildGeneralWordGenerationPrompt(params: { spell: string }) {
  return [
    `目标单词：${params.spell}`,
    "请直接给出该词在考研阅读里最常见、最值得迁移记忆的一套卡片信息。",
    "representativeSentence 必须是你生成的代表性句子，且必须包含目标单词本身。",
  ].join("\n");
}

function buildPhrasePrompt(params: { spell: string; mode: RecordMode; year?: string; sourceTextId?: string; sourceText?: string }) {
  if (params.mode === "general") {
    return [`目标词组：${params.spell}`, "请给出该词组在考研阅读里最常见的用法和考点。"].join("\n");
  }
  return [
    `目标词组：${params.spell}`,
    `考研年份：${params.year ?? ""}`,
    `文章来源：${params.sourceTextId ?? ""}`,
    "正文开始",
    params.sourceText ?? "",
    "正文结束",
  ].join("\n");
}

function buildRareMeaningPrompt(params: { spell: string; mode: RecordMode; year?: string; sourceTextId?: string; sourceText?: string }) {
  if (params.mode === "general") {
    return [`目标单词：${params.spell}`, "请挖掘该词在考研阅读中常被忽略的僻义。"].join("\n");
  }
  return [
    `目标单词：${params.spell}`,
    `考研年份：${params.year ?? ""}`,
    `文章来源：${params.sourceTextId ?? ""}`,
    "正文开始",
    params.sourceText ?? "",
    "正文结束",
  ].join("\n");
}

function buildComparisonPrompt(wordA: string, wordB: string) {
  return [
    `请辨析以下两个易混淆单词：${wordA} 与 ${wordB}`,
    "生成对比记忆卡片，帮助考生区分两词的核心差异。",
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
  mode: RecordMode;
  year?: string;
  sourceTextId?: string;
  sourceText?: string;
}): RequestInit {
  const prompt = params.mode === "general"
    ? buildGeneralWordGenerationPrompt({ spell: params.spell })
    : buildWordGenerationPrompt({
        spell: params.spell,
        year: params.year ?? "",
        sourceTextId: params.sourceTextId ?? "",
        sourceText: params.sourceText ?? "",
      });

  return buildJsonRequestInit({
    apiKey: params.apiKey,
    endpoint: params.endpoint,
    modelName: params.modelName,
    systemPrompt: params.mode === "general" ? GENERAL_ANALYZER_SYSTEM_PROMPT : ANALYZER_SYSTEM_PROMPT,
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
  mode: RecordMode;
  year?: string;
  sourceTextId?: string;
  sourceText?: string;
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

export async function generatePhraseDraft(params: {
  apiKey: string;
  baseUrl: string;
  modelName: string;
  spell: string;
  mode: RecordMode;
  year?: string;
  sourceTextId?: string;
  sourceText?: string;
}): Promise<AiPhraseDraftPayload> {
  const userPrompt = buildPhrasePrompt(params);
  return requestJsonPayload<AiPhraseDraftPayload>({
    apiKey: params.apiKey,
    baseUrl: params.baseUrl,
    modelName: params.modelName,
    buildInit: ({ endpoint, modelName }) =>
      buildJsonRequestInit({
        apiKey: params.apiKey,
        endpoint,
        modelName,
        systemPrompt: PHRASE_ANALYZER_SYSTEM_PROMPT,
        userPrompt,
        maxTokens: 1800,
      }),
  });
}

export async function generateRareMeaningDraft(params: {
  apiKey: string;
  baseUrl: string;
  modelName: string;
  spell: string;
  mode: RecordMode;
  year?: string;
  sourceTextId?: string;
  sourceText?: string;
}): Promise<AiRareMeaningDraftPayload> {
  const userPrompt = buildRareMeaningPrompt(params);
  return requestJsonPayload<AiRareMeaningDraftPayload>({
    apiKey: params.apiKey,
    baseUrl: params.baseUrl,
    modelName: params.modelName,
    buildInit: ({ endpoint, modelName }) =>
      buildJsonRequestInit({
        apiKey: params.apiKey,
        endpoint,
        modelName,
        systemPrompt: RARE_MEANING_ANALYZER_SYSTEM_PROMPT,
        userPrompt,
        maxTokens: 1800,
      }),
  });
}

export async function generateComparisonDraft(params: {
  apiKey: string;
  baseUrl: string;
  modelName: string;
  wordA: string;
  wordB: string;
}): Promise<AiComparisonDraftPayload> {
  const userPrompt = buildComparisonPrompt(params.wordA, params.wordB);
  return requestJsonPayload<AiComparisonDraftPayload>({
    apiKey: params.apiKey,
    baseUrl: params.baseUrl,
    modelName: params.modelName,
    buildInit: ({ endpoint, modelName }) =>
      buildJsonRequestInit({
        apiKey: params.apiKey,
        endpoint,
        modelName,
        systemPrompt: COMPARISON_ANALYZER_SYSTEM_PROMPT,
        userPrompt,
        maxTokens: 1800,
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
