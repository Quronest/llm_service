import { ChatPromptTemplate } from "@langchain/core/prompts";
import geminiLLM from "../llm/gemini.llm";
import { groupDetailsPrompt } from "../prompts/groupDetails.prompt";

interface AssistantChainParams {
  userPrompt: string;
  chatContext?: string;
  userContext?: string;
  groupContext?: string;
}

export const createAssistantStream = async (params: AssistantChainParams) => {
  const {
    userPrompt,
    chatContext = "",
    userContext = "",
    groupContext = "",
  } = params;

  const promptTemplate = ChatPromptTemplate.fromMessages([ 
    [
      "system",
      `
${groupDetailsPrompt}  
{userContext}
{chatContext}
      `.trim(),
    ],
    ["user", "{userPrompt}"],
  ]);

  const llm = geminiLLM();

  const chain = promptTemplate.pipe(llm);

  return await chain.stream({
    userPrompt,
    chatContext,
    userContext,
    groupContext,
  });
};
