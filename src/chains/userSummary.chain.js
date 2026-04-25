import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { groupPhaseBasePrompt } from "../prompts/groupPhaseBase.prompt.js";
import { userContextPrompt } from "../prompts/userContextBase.prompt.js";
import { userSummaryPrompt } from "../prompts/userSummary.prompt.js";
import { createModuleLogger } from "../utils/logger.js";
const log = createModuleLogger(import.meta.url);

const userSummarySchema = z.object({
  group: z.enum(["GROUP_A", "GROUP_B", "GROUP_C"]),
  phase: z.enum(["PHASE_1", "PHASE_2", "PHASE_3"]),
  summary: z.string(),
});

const parser = StructuredOutputParser.fromZodSchema(userSummarySchema);

const finalPrompt = ChatPromptTemplate.fromMessages([
  ...groupPhaseBasePrompt.promptMessages,
  ...userContextPrompt.promptMessages,
  ...userSummaryPrompt.promptMessages,
]);

export const createUserSummaryChain = (llm) => {
  return RunnableSequence.from([
    finalPrompt.partial({
      format_instructions: parser.getFormatInstructions(),
    }),
    llm.withConfig({
      response_format: { type: "json_object" }, // Force JSON output
    }),
    parser,
  ]);
};

export const generateUserSummary = async (data, llm) => {
  const { academic_data = {}, personal_data = {} } = data;

  const {
    institute_name,
    grade,
    course,
    description,
    interested_domains = [],
  } = academic_data;

  const { skills = [], primary_goal, experience } = personal_data;
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
  });
};
