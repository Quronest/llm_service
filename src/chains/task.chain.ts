import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

import { createModuleLogger } from "../utils/logger";
import { groupPahseRulesPromptMap } from "../prompts/taskProgressionRules.prompt";
import { groupDetailsPrompt } from "../prompts/groupDetails.prompt";
import { userContextPrompt } from "../prompts/userContext.prompt";
import { generateDailyTaskPrompt } from "../prompts/generateDailyTask.prompt";
import { type Group, type Phase, taskTypeEnumList } from "../enums";
import { LlmWithConfig } from "../types/llmConfigType";
import { TaskCreateInputType } from "../schemas/taskGenerateInputValidation.schema";

const log = createModuleLogger(import.meta.url);

const taskSchema = z.object({
  title: z.string(),
  type: z.enum(taskTypeEnumList),
  description: z.string(),
  expectedCompletionTime: z.string().min(1),
});

const daySchema = z.object({
  title: z.string(),
  description: z.string(),
  tasks: z.array(taskSchema).min(3),
});

const planSchema = z.object({
  plan: z.array(daySchema).length(7),
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

export const createTasksChain = (
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

export const generateTasks = async (
  data: TaskCreateInputType,
  llm: LlmWithConfig,
) => {
  const { userContext } = data;
  const { current_group: group, current_phase: phase } = userContext;
  log.info("creating tasks chain...");

  const chain = createTasksChain(llm, group, phase);

  log.info("Invoking tasks chain...");

  const rawResponse = (await chain.invoke({
    ...userContext,
    format_instructions: parser.getFormatInstructions(),
  })) as PlanResponse;

  const transformedPlan = rawResponse.plan.map((dayItem, dayIndex) => {
    return {
      day: dayIndex + 1,
      ...dayItem,
      tasks: dayItem.tasks.map((taskItem, taskIndex) => ({
        task: taskIndex + 1,
        ...taskItem,
      })),
    };
  });

  return { plan: transformedPlan };
};
