import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

import { groupDetailsPrompt } from "../prompts/groupDetails.prompt";
import { userSummaryPrompt } from "../prompts/userSummary.prompt";
import { createModuleLogger } from "../utils/logger";
import { userSummarySchema, type UserSummaryResponse } from "../schemas/userSummary.schema";
import { type LlmWithConfig, type UserSummaryInput } from "../types";

const log = createModuleLogger(import.meta.url);

const parser = StructuredOutputParser.fromZodSchema(userSummarySchema);

const combinedSystemText = `
${groupDetailsPrompt}
${userSummaryPrompt}
`;

const finalPrompt = PromptTemplate.fromTemplate(combinedSystemText);

export const createUserSummaryChain = (llm: LlmWithConfig) => {
  return RunnableSequence.from([
    finalPrompt,
    llm.withConfig({
      response_format: { type: "json_object" },
    }),
    parser,
  ]);
};

export const generateUserSummary = async (
  data: UserSummaryInput,
  llm: LlmWithConfig,
): Promise<UserSummaryResponse> => {
  const { academic_data = {}, personal_data = {} } = data;

  const {
    institute_name,
    grade,
    course,
    description,
    interested_domains = [],
  } = academic_data;

  const { skills = [], primary_goal = "N/A", experience = "N/A" } = personal_data;

  log.info("creating chain...");
  const chain = createUserSummaryChain(llm);
  
  log.info("Invoking in chain...");
  
  return (await chain.invoke({
    institute_name,
    grade,
    course,
    description,
    interested_domains: interested_domains.join(", "),
    skills: skills.join(", "),
    primary_goal,
    experience,
    format_instructions: parser.getFormatInstructions(),
  })) as UserSummaryResponse;
};
