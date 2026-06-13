import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import type { RunnableLike } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

import { groupDetailsPrompt } from "../prompts/groupDetails.prompt";
import { userSummaryPrompt } from "../prompts/userSummary.prompt";
import { createModuleLogger } from "../utils/logger";
import { userGroupEnumList, phaseEnumList } from "../enums";

const log = createModuleLogger(import.meta.url);

const userSummarySchema = z.object({
  group: z.enum(userGroupEnumList),
  phase: z.enum(phaseEnumList),
  summary: z.string(),
});

const parser = StructuredOutputParser.fromZodSchema(userSummarySchema);

type LlmWithConfig = {
  withConfig: (config: Record<string, unknown>) => RunnableLike;
};

type UserSummaryInput = {
  academic_data?: {
    institute_name?: string;
    grade?: string;
    course?: string;
    description?: string;
    interested_domains?: string[];
  };
  personal_data?: {
    skills?: string[];
    primary_goal?: string;
    experience?: string;
  };
};

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
) => {
  const { academic_data = {}, personal_data = {} } = data;

  const {
    institute_name,
    grade,
    course,
    description,
    interested_domains = [],
  } = academic_data;

  const {
    skills = [],
    primary_goal = "N/A",
    experience = "N/A",
  } = personal_data;

  log.info("creating chain...");
  const chain = createUserSummaryChain(llm);

  log.info("Invoking in chain...");

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
