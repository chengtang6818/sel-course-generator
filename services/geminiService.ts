

import { GoogleGenAI, Type, GenerateContentResponse, GenerateContentParameters } from "@google/genai";
import { CONFIG } from '../config';

const API_KEY = CONFIG.GEMINI_API_KEY;

// Debug info (can be removed in production)
console.log('🔑 Using API Key:', API_KEY ? API_KEY.substring(0, 15) + '...' : 'MISSING');
console.log('🔑 API Key length:', API_KEY ? API_KEY.length : 0);

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const MAX_RETRIES = CONFIG.MAX_RETRIES;
const INITIAL_DELAY_MS = CONFIG.INITIAL_DELAY_MS;

async function generateWithRetry(request: GenerateContentParameters): Promise<GenerateContentResponse> {
  let lastError: Error | null = null;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await ai.models.generateContent(request);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`API call attempt ${i + 1} failed:`, lastError.message);

      const isRateLimitError = lastError.message.includes('429') || lastError.message.toLowerCase().includes('quota');
      const isNetworkError = lastError.message.includes('ENOTFOUND') ||
                           lastError.message.includes('ETIMEDOUT') ||
                           lastError.message.includes('network') ||
                           lastError.message.includes('timeout');

      // Retry on rate limit, network errors, or server errors
      if (i < MAX_RETRIES - 1 && (isRateLimitError || isNetworkError)) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, i);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw lastError; // Rethrow last error if max retries reached or not a retryable error
      }
    }
  }
  throw lastError || new Error("An unknown error occurred after multiple retries.");
}


export async function parseCoursesFromText(text: string): Promise<{ skill: string; ageGroup: string; }[]> {
  const prompt = `
您是一位专业的数据提取助理。请从以下用户提供的文本中，识别并提取出所有关于SEL课程的请求。
对于每一个课程请求，您需要明确地找出两个关键信息：
1.  **具体技能点 (skill)**: 这是课程的核心主题，例如 "情绪识别", "自我管理", "同理心" 等。
2.  **年龄段 (ageGroup)**: 这是课程的目标学员年龄，例如 "3-5岁", "6-8岁", "9-12岁" 等。

请将提取出的信息以一个JSON数组的格式返回，数组中的每个对象都包含 "skill" 和 "ageGroup" 两个字段。如果文本中没有明确的课程请求，请返回一个空数组。

例如，如果用户输入:
"我想为3到5岁的孩子设计一个关于认识情绪的课程，再来一个给大一点的9-12岁孩子的情绪管理课。"

您应该返回:
[
  { "skill": "认识情绪", "ageGroup": "3-5岁" },
  { "skill": "情绪管理", "ageGroup": "9-12岁" }
]

这是需要您处理的文本:
---
${text}
---
`;

  try {
    const response = await generateWithRetry({
        model: CONFIG.DEFAULT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                ageGroup: { type: Type.STRING },
              },
              required: ["skill", "ageGroup"],
            },
          },
        },
    });
    
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Error parsing text with Gemini API after retries:", error);
     if (error instanceof Error) {
        throw new Error(`Gemini API Error during parsing: ${error.message}`);
    }
    throw new Error("An unknown error occurred while parsing text with the Gemini API.");
  }
}


export async function generateCourseContent(
  skill: string,
  age: string,
  knowledgeBaseText: string
): Promise<string> {
  const knowledgePrompt = knowledgeBaseText
    ? `
---
知识库参考内容:
${knowledgeBaseText}
---
`
    : '';

  const prompt = `
您是一位专业的儿童SEL（社交情感学习）课程设计专家。请基于以下知识库内容（如果提供）和SEL技能点，为家长生成一堂结构完整、内容科学、易于实践的课程文本内容。请严格按照给定的markdown格式和模版进行输出。

${knowledgePrompt}

输入：
技能点: ${skill}
年龄段: ${age}

输出模版 (请务必遵循此结构和编号):
1. 本堂课标题：SEL家长同行课程 - 第n堂：XX (请根据技能点填充n和XX，n可以是一个合适的数字)
2. 为什么重要：深入浅出地解释为什么这个技能对孩子很重要，并提供1个源于真实生活的实际例子来说明。
3. 核心知识：提供2-3个关于此技能的核心科学观念，帮助家长建立正确的认知。内容需专业、精炼。
4. 家庭活动：设计3个富有创意且易于操作的家庭游戏活动，以训练孩子的该项技能。每个活动都必须包括活动名称、活动目的、活动规则或步骤、以及活动所需的材料（尽量使用家庭常见物品）。
5. 日常强化技巧：提供具体的指导，当孩子在日常生活中表现出相关行为时（说什么/做什么），家长应该如何反馈（正面引导），以及不应该如何反馈（错误示范）。
6. 关于该话题的常见问题及解答：列出2-3个家长关于此话题的常见问题，并提供专业、可行的解答。
7. 资料包：提供活动可能需要的物料和资料的简要说明，并在此处放置一个统一的助教联系方式占位符，例如：“如有任何疑问或需要活动资料，请联系助教：[在此插入助教联系方式]”。
`;

  try {
    const response = await generateWithRetry({
        model: CONFIG.DEFAULT_MODEL,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content with Gemini API after retries:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
}