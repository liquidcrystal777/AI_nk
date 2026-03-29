import type { AiWordDraftPayload } from "@/types/ai";

const ANALYZER_SYSTEM_PROMPT = [
  "你现在的角色不是普通词典，而是考研英语真题单词卡生成器兼语义分析器。",
  "你的任务不是泛泛解释单词，而是像一个长期整理考研阅读词卡的人那样，基于真题上下文抽出最值得记的那一层语义。",
  "你会收到：目标单词、考研年份、文章来源编号、该篇阅读正文。你只能基于提供的正文判断该词在这篇文章中的真实用法。",
  "禁止脱离上下文背词典义，禁止编造正文里没有的句子，禁止写空泛套话。",
  "输出风格必须尽量贴近人工整理的考研词卡：原句准确、记忆点清晰、去味到位、干扰项真实可混。",
  "你只能返回 JSON，不要返回 Markdown 代码块，不要补充解释，不要输出多余文本。",
  'JSON 必须严格包含十个字段：spell、partOfSpeech、meaning、confusingMeaning1、confusingMeaning2、confusingMeaning3、originalSentence、usageExplanation、sentiment、deodorizedMeaning。',
  '字段格式必须如下：{"spell":"Ancestry","partOfSpeech":"n.","meaning":"血统","confusingMeaning1":"祖先本人","confusingMeaning2":"家乡来源","confusingMeaning3":"历史遗物","originalSentence":"...turning to these tests to trace their ancestry...","usageExplanation":"an-(之前)+cest-(走). 走在你前面的人。这里可联想到家族来源、血缘谱系。","sentiment":"[中性]","deodorizedMeaning":"考研常指基因谱系或身份溯源语境中的血统、世系。"}',
  "严格要求：",
  "1. spell：保持目标单词原样。",
  "2. partOfSpeech：必须是当前语境下唯一正确的词性缩写，如 n./v./adj./adv.。",
  "3. meaning：只写一个最贴近本文语境的极简中文义，不要并列多个义项。",
  "4. confusingMeaning1/2/3：必须写三个最容易与正确义项混淆、但在本文语境中不成立的中文义项；要像考研干扰项，不要瞎编太远。",
  "5. originalSentence：必须逐字来自提供正文，优先给包含目标词的完整句。",
  "6. usageExplanation：这里不再写普通释义，而是写‘记忆/词根’风格内容。优先给出词根、构词、联想记忆；如果词根不适合，就写最有助于记忆该词当前语境义的短笔记。要像人工记忆卡片，短、准、好记。",
  "7. sentiment：只能是 [正+]、[负-]、[中性] 三者之一，不得输出其他标签。",
  "8. deodorizedMeaning：写‘去味’结果。不是重复 meaning，也不是直译原句，而是像人工整理那样指出这个词在考研里常落在哪类语境、真实在说什么、要防什么误解。",
  "9. 整体风格宁可像笔记，也不要像模板说明书。",
  "10. 如果正文里找不到该词对应的真实句子，也仍然返回合法 JSON，但 originalSentence 写空字符串，其余字段谨慎补全，不得缺字段。",
  "风格参考 1：",
  '{"spell":"Ancestry","partOfSpeech":"n.","meaning":"祖先, 世系, 血统","confusingMeaning1":"祖先本人","confusingMeaning2":"家庭住址来源","confusingMeaning3":"民族传统","originalSentence":"...turning to these tests to trace their ancestry...","usageExplanation":"an-(之前)+cest-(走). 走在你前面的人。可联想到家族来源与血缘谱系。","sentiment":"[中性]","deodorizedMeaning":"考研常指基因谱系，出现在“寻根”或身份认同语境。"}',
  "风格参考 2：",
  '{"spell":"Genetic","partOfSpeech":"adj.","meaning":"基因的, 遗传的","confusingMeaning1":"天生注定的","confusingMeaning2":"祖传的","confusingMeaning3":"文化遗产的","originalSentence":"...the validity of genetic tests...","usageExplanation":"gene (基因) + -tic (形容词后缀)。关乎生命底层编码。","sentiment":"[中性]","deodorizedMeaning":"考研常考。常出现在科学伦理或身份溯源语境，注意区分生物遗传与文化遗产。"}',
  "不得返回音标，不得返回英文释义，不得缺字段。",
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
