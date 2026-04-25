import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

import { groupPhaseBasePrompt } from "../prompts/groupPhaseBase.prompt.js";
import { userContextPrompt } from "../prompts/userContextBase.prompt.js";
import { taskPrompt } from "../prompts/task.prompt.js";

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

const fullPrompt = ChatPromptTemplate.fromMessages([
  ...groupPhaseBasePrompt.promptMessages,
  ...userContextPrompt.promptMessages,
  ...taskPrompt.promptMessages,
]);

export const createTasksChain = (llm) => {
  return RunnableSequence.from([
    fullPrompt.partial({
      format_instructions: parser.getFormatInstructions(),
    }),
    llm.withConfig({
      response_format: { type: "json_object" },
    }),
    parser,
  ]);
};

export const generateTasks = async (data, llm) => {
  const group = data?.group;
  const phase = data?.phase;

  const academic_data = data?.academic_data ?? data;
  const personal_data = data?.personal_data ?? data;

  const chain = createTasksChain(llm);

  const skills = Array.isArray(personal_data?.skills)
    ? personal_data.skills
    : [];

  const interestedDomains = Array.isArray(personal_data?.interested_domains)
    ? personal_data.interested_domains
    : [];

  return chain.invoke({
    // group
    group,
    phase,

    // academic
    grade: academic_data?.grade ?? "Not specified",
    course: academic_data?.course ?? "Not specified",
    description: academic_data?.description ?? "Not specified",
    institute_name: academic_data?.institute_name ?? "Not specified",

    // personal
    skills: skills.length ? skills.join(", ") : "None",
    experience: personal_data?.experience ?? "No experience",
    primary_goal: personal_data?.primary_goal ?? "Not specified",
    interested_domains: interestedDomains.length
      ? interestedDomains.join(", ")
      : "None",

    // journey
    current_Group: data?.current_Group ?? group,
    current_Phase: data?.current_Phase ?? phase,
    current_Day: data?.current_Day ?? 1,
    streak_Days: data?.streak_Days ?? 0,
    total_Active_Days: data?.total_Active_Days ?? 0,
    last_Active_At: data?.last_Active_At ?? "N/A",
  });
};