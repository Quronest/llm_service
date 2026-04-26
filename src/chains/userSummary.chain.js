// src/chains/userSummary.chain.js
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { groupPhaseBaseMessages } from "../prompts/groupPhaseBase.prompt.js";
import { userContextMessages } from "../prompts/userContextBase.prompt.js";
import { userSummaryMessages } from "../prompts/userSummary.prompt.js";
import { createModuleLogger } from "../utils/logger.js";

const log = createModuleLogger(import.meta.url);

const userSummarySchema = z.object({
  group: z.enum(["GROUP_A", "GROUP_B", "GROUP_C"]),
  phase: z.enum(["PHASE_1", "PHASE_2", "PHASE_3"]),
  summary: z.string(),
});

const parser = StructuredOutputParser.fromZodSchema(userSummarySchema);

// 1. Extract the text strings from your imported arrays and combine them
const combinedSystemText = `
${groupPhaseBaseMessages[0][1]}

${userContextMessages[0][1]}
`;

// 2. Create the prompt with exactly ONE system message at the top
const finalPrompt = ChatPromptTemplate.fromMessages([
  ["system", combinedSystemText], 
  ...userSummaryMessages,         
]);

export const createUserSummaryChain = (llm) => {
  return RunnableSequence.from([
    finalPrompt,
    llm.withConfig({
      response_format: { type: "json_object" },
    }),
    parser,
  ]);
};

export const generateUserSummary = async (data, llm) => {
  const { academic_data = {}, personal_data = {}, journey_context = {} } = data;

  const {
    institute_name = "N/A",
    grade = "N/A",
    course = "N/A",
    description = "N/A",
    interested_domains = [],
  } = academic_data;

  const { 
    skills = [], 
    primary_goal = "N/A", 
    experience = "N/A" 
  } = personal_data;

  const {
    current_group = "N/A",
    current_phase = "N/A",
    current_day = "0",
    streak_days = "0",
    total_active_days = "0",
    last_active_at = "N/A"
  } = journey_context;

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
    current_group,
    current_phase,
    current_day,
    streak_days,
    total_active_days,
    last_active_at,
    format_instructions: parser.getFormatInstructions(),
  });
};