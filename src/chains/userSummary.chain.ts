import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import type { RunnableLike } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

import { groupDetailsPrompt } from "../prompts";
import { userSummaryPrompt } from "../prompts";
import { createModuleLogger } from "../utils/logger";
import { userGroupEnumList, phaseEnumList } from "../enums";
import { UserSummaryGenerateDataType } from "../schemas/userSummaryData.schema";
import { LlmWithConfig } from "../types/llmConfigType";

const log = createModuleLogger(import.meta.url);

const userSummarySchema = z.object({
  group: z.enum(userGroupEnumList),
  phase: z.enum(phaseEnumList),
  summary: z.string(),
});

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
  data: UserSummaryGenerateDataType,
  llm: LlmWithConfig,
) => {
  const { academic_data, personal_data } = data;

  const { institute_name, grade, course, description } = academic_data;

  const {
    skills = [],
    primary_goal,
    experience,
    interested_domains = [],
  } = personal_data;

  const chain = createUserSummaryChain(llm);

  return await chain.invoke({
    institute_name,
    grade,
    course,
    description,
    interested_domains: interested_domains.join(", "),
    skills: skills.join(", "),
    primary_goal,
    experience,
    format_instructions: parser.getFormatInstructions(),
  });
};
