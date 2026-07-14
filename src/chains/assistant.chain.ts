import { ChatPromptTemplate } from "@langchain/core/prompts";

import geminiLLM from "../llm/gemini.llm";
import { groupDetailsPrompt, assistantPrompt } from "../prompts";

interface AssistantChainParams {
  userPrompt: string;
  chatContext?: string;
  userContext?: string;
}

export const createAssistantStream = async (params: AssistantChainParams) => {
  const { userPrompt, chatContext = "", userContext = "" } = params;

  const SYSTEM_PROMPT = `
${assistantPrompt}
${groupDetailsPrompt} 
{userContext}
{chatContext}
`;

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    ["user", "{userPrompt}"],
  ]);

  const llm = geminiLLM();

  const chain = promptTemplate.pipe(llm);

  return await chain.stream({
    userPrompt,
    chatContext,
    userContext,
  });
};
