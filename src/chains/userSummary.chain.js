// src/chains/userSummary.chain.js
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { groupDetailsPrompt } from "../prompts/groupDetails.prompt.js";
import { userCurrentGroupStatus } from "../prompts/userCurrentGroupStatus.prompt.js";
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
${groupDetailsPrompt}
\n
{format_instructions}
`;

// 2. Create the prompt with exactly ONE system message at the top
const finalPrompt = ChatPromptTemplate.fromMessages([
  ["system", combinedSystemText], 
  ["human", userCurrentGroupStatus], // FIX: Passed as a single template string, no spread operator!
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
  const { academic_data = {}, personal_data = {}} = data;

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