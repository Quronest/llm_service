import { ChatPromptTemplate } from "@langchain/core/prompts";

export const buildPrompt = (...promptParts) => {
  const messages = promptParts.flatMap((p) => p.messages);
  return ChatPromptTemplate.fromMessages(messages);
};