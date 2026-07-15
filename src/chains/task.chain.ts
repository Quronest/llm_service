import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

import logger, { createModuleLogger } from "../utils/logger";
import { groupPahseRulesPromptMap } from "../prompts/taskProgressionRules.prompt";
import {
  groupDetailsPrompt,
  userContextPrompt,
  generateDailyTaskPrompt,
} from "../prompts";
import {
  type Group,
  type Phase,
  taskTypeEnumList,
  domainEnumList,
  taskTagEnumList,
  levelEnumList,
} from "../enums";
import { LlmWithConfig } from "../types/llmConfigType";
import { DailyPlanGenerateInputType } from "../schemas/dailyPlanGenerateInputValidation.schema";

const log = createModuleLogger(import.meta.url);

const taskSchema = z.object({
  title: z.string().describe("Task title"),
  type: z.enum(taskTypeEnumList).describe("Type of task"),
  description: z.string().describe("Detailed description of the task"),
  llm_context: z
    .string()
    .describe(
      "Task boundary context describing the exact scope of this task and how it relates to the previous and next task in the same day",
    ),
  domain: z.enum(domainEnumList).describe("Domain the task belongs to"),
  subdomains: z
    .array(z.string())
    .min(1)
    .describe("List of subdomains related to the task"),
  tags: z
    .array(z.enum(taskTagEnumList))
    .min(1)
    .max(4)
    .describe("Tags for categorizing the task (1-4 tags)"),
  level: z.enum(levelEnumList).describe("Difficulty level of the task"),
  expected_total_minutes: z
    .number()
    .min(1)
    .describe("Expected time to complete the task in minutes"),
});

const daySchema = z.object({
  title: z.string().describe("Title for the day's plan"),
  description: z
    .string()
    .describe("Description of the day's focus and objectives"),
  llm_context: z
    .string()
    .describe(
      "Day boundary context describing how much of the learning path this day should cover and how it connects to the previous and next days",
    ),
  tasks: z
    .array(taskSchema)
    .min(5)
    .max(8)
    .describe("List of tasks for the day (5-8 tasks)"),
});

const planSchema = z.object({
  plan: z
    .array(daySchema)
    .length(7)
    .describe("Weekly plan with 7 days of tasks"),
});

const parser = StructuredOutputParser.fromZodSchema(planSchema);
type PlanResponse = z.infer<typeof planSchema>;

const CombinedSystemText = (group: Group, phase: Phase) => {
  const progressionRules = groupPahseRulesPromptMap[group][phase];

  return `
${groupDetailsPrompt}
${userContextPrompt}
${progressionRules}
${generateDailyTaskPrompt}
`;
};

export const createDailyPlanChain = (
  llm: LlmWithConfig,
  group: Group,
  phase: Phase,
) => {
  const finalPrompt = PromptTemplate.fromTemplate(
    CombinedSystemText(group, phase),
  );
  return RunnableSequence.from([
    finalPrompt,
    llm.withConfig({
      response_format: { type: "json_object" },
    }),
    parser,
  ]);
};

export const generatePlan = async (
  data: DailyPlanGenerateInputType,
  llm: LlmWithConfig,
) => {
  const { user_context: userContext } = data;
  const { current_group: group, current_phase: phase } = userContext;

  const chain = createDailyPlanChain(llm, group, phase);

  const rawResponse = (await chain.invoke({
    ...userContext,
    format_instructions: parser.getFormatInstructions(),
  })) as PlanResponse;

  const transformedPlan = rawResponse.plan.map((dayItem, dayIndex) => {
    return {
      day_number: dayIndex + 1,
      ...dayItem,
      tasks: dayItem.tasks.map((taskItem, taskIndex) => ({
        task_number: taskIndex + 1,
        ...taskItem,
      })),
    };
  });

  return { plan: transformedPlan };
};
