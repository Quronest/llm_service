import { ChatPromptTemplate } from "@langchain/core/prompts";
import geminiLLM from "../llm/gemini.llm";
import { groupDetailsPrompt } from "../prompts/groupDetails.prompt";
import { assistantSystemPrompt } from "../prompts/assistant.prompt";

interface AssistantChainParams {
  userPrompt: string;
  chatContext?: string;
  userContext?: string;
}

export const createAssistantStream = async (params: AssistantChainParams) => {
  const {
    userPrompt,
    chatContext = "",
    userContext = "",
  } = params;

  const SYSTEM_PROMPT=`
${assistantSystemPrompt}
${groupDetailsPrompt} 
{userContext}
{chatContext}
`

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
