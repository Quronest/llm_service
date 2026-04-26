import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { createModuleLogger } from "../utils/logger.js";

import { groupPhaseBaseMessages } from "../prompts/groupPhaseBase.prompt.js";
import { userContextMessages } from "../prompts/userContextBase.prompt.js";
import { taskMessages } from "../prompts/task.prompt.js"; 

const log = createModuleLogger(import.meta.url);

const taskSchema = z.object({
  task: z.number(),
  title: z.string(),
  type: z.enum(["Reading", "Practice", "Test"]),
  description: z.string(),
  expectedCompletionTime: z.string().min(1),
});

const daySchema = z.object({
  day: z.number(),
  title: z.string(),
  description: z.string(),
  tasks: z.array(taskSchema).min(3),
});

const planSchema = z.object({
  plan: z.array(daySchema).length(7),
});

const parser = StructuredOutputParser.fromZodSchema(planSchema);

// 1. Combine system instructions into a single block for Gemini
const combinedSystemText = `
${groupPhaseBaseMessages[0][1]}

${userContextMessages[0][1]}
`;

// 2. Create the unified prompt
const finalPrompt = ChatPromptTemplate.fromMessages([
  ["system", combinedSystemText],
  ...taskMessages,
]);

export const createTasksChain = (llm) => {
  return RunnableSequence.from([
    finalPrompt, 
    llm.withConfig({
      response_format: { type: "json_object" },
    }),
    parser,
  ]);
};

export const generateTasks = async (data, llm) => {

  const { group, phase, academic_data = {}, personal_data = {}, journey_context = {} } = data;

  log.info("creating tasks chain...");
  const chain = createTasksChain(llm);

  const skills = Array.isArray(personal_data.skills) ? personal_data.skills : [];
  const interestedDomains = Array.isArray(personal_data.interested_domains) ? personal_data.interested_domains : [];

  log.info("Invoking tasks chain...");
  return await chain.invoke({
    group: group ?? "N/A",
    phase: phase ?? "N/A",

    grade: academic_data.grade ?? "Not specified",
    course: academic_data.course ?? "Not specified",
    description: academic_data.description ?? "Not specified",
    institute_name: academic_data.institute_name ?? "Not specified",

    skills: skills.length ? skills.join(", ") : "None",
    experience: personal_data.experience ?? "No experience",
    primary_goal: personal_data.primary_goal ?? "Not specified",
    interested_domains: interestedDomains.length ? interestedDomains.join(", ") : "None",

    current_group: journey_context.current_group ?? group ?? "N/A",
    current_phase: journey_context.current_phase ?? phase ?? "N/A",
    current_day: journey_context.current_day ?? "1",
    streak_days: journey_context.streak_days ?? "0",
    total_active_days: journey_context.total_active_days ?? "0",
    last_active_at: journey_context.last_active_at ?? "N/A",
    
    format_instructions: parser.getFormatInstructions(),
  });
};