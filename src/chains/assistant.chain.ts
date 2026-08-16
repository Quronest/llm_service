import { ChatPromptTemplate } from "@langchain/core/prompts";

import geminiLLM from "../llm/gemini.llm";
import { groupDetailsPrompt, assistantPrompt } from "../prompts";

interface AssistantChainParams {
  userPrompt: string;
  chatContexts?: string;
  userContext?: string;
  taskContexts?: string;
}

export const createAssistantStream = async (params: AssistantChainParams) => {
  const {
    userPrompt,
    chatContexts = "",
    userContext = "",
    taskContexts = "",
  } = params;

  const SYSTEM_PROMPT = `
${assistantPrompt}
${groupDetailsPrompt} 
{userContext}
{taskContexts}
{chatContexts}
`;

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    ["user", "{userPrompt}"],
  ]);

  const llm = geminiLLM();

  const chain = promptTemplate.pipe(llm);

  return await chain.stream({
    userPrompt,
    chatContexts,
    userContext,
    taskContexts,
  });
};
