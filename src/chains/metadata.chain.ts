import { PromptTemplate } from "@langchain/core/prompts";

import geminiLLM from "../llm/gemini.llm";
import { createModuleLogger } from "../utils/logger";
import { chatTitlePrompt, chatSummaryPrompt } from "../prompts";

const log = createModuleLogger(import.meta.url);

export const generateChatTitle = async (
  userPrompt: string,
  aiResponse: string,
): Promise<string> => {
  try {
    const prompt = PromptTemplate.fromTemplate(chatTitlePrompt);
    const llm = geminiLLM();
    const chain = prompt.pipe(llm);

    const titleResult = await chain.invoke({
      userPrompt,
      aiResponse: aiResponse.substring(0, 1000),
    });

    const title =
      typeof titleResult.content === "string"
        ? titleResult.content
        : String(titleResult.content ?? "");

    return title.trim();
  } catch (error) {
    log.error(`Error generating chat title: ${error}`);
    return "New Chat";
  }
};

export const generateChatSummary = async (
  chatContext: string,
  userPrompt: string,
  aiResponse: string,
): Promise<string> => {
  try {
    const prompt = PromptTemplate.fromTemplate(chatSummaryPrompt);
    const llm = geminiLLM();
    const chain = prompt.pipe(llm);

    const summaryResult = await chain.invoke({
      chatContext,
      userPrompt,
      aiResponse: aiResponse.substring(0, 2000),
    });

    const summary =
      typeof summaryResult.content === "string"
        ? summaryResult.content
        : String(summaryResult.content ?? "");

    return summary.trim();
  } catch (error) {
    log.error(`Error generating chat summary: ${error}`);
    return "Summary unavailable.";
  }
};
