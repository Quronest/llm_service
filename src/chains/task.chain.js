import { z } from "zod";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { taskPrompt } from "../prompts/task.prompt.js";

const taskSchema = z.object({
  task: z.number(),
  title: z.string(),
  type: z.enum(["Reading", "Practice", "Test"]),
  description: z.string(),
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

export const createTasksChain = (llm) => {
  return RunnableSequence.from([
    taskPrompt,
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
    group,
    phase,

    grade: academic_data?.grade ?? "",
    course: academic_data?.course ?? "",
    description: academic_data?.description ?? "",
    institute_name: academic_data?.institute_name ?? "",

    skills: skills.join(", "),
    experience: personal_data?.experience ?? "",
    primary_goal: personal_data?.primary_goal ?? "",
    interested_domains: interestedDomains.join(", "),
    format_instructions: parser.getFormatInstructions(),
  });
};
