import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { createModuleLogger } from "../utils/logger.js";
import { groupPahseRulesPromptMap } from "../prompts/taskProgressionRules.prompt.js";
import { groupDetailsPrompt } from "../prompts/groupDetails.prompt.js";
import { userContextPrompt } from "../prompts/userContext.prompt.js";
import { generateDailyTaskPrompt } from "../prompts/generateDailyTask.prompt.js";

const log = createModuleLogger(import.meta.url);

const taskSchema = z.object({
  title: z.string(),
  type: z.enum(["Reading", "Quiz", "Coding", "Descriptive"]),
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

const CombinedSystemText = (group, phase) => {
  const progressionRules = groupPahseRulesPromptMap[group][phase];

  return `
${groupDetailsPrompt}
${userContextPrompt}
${progressionRules}
${generateDailyTaskPrompt}
`;
};

export const createTasksChain = (llm, group, phase) => {
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

export const generateTasks = async (data, llm) => {
  const { userContext = {} } = data;
  const { current_group: group, current_phase: phase } = userContext;
  log.info("creating tasks chain...");

  const chain = createTasksChain(llm, group, phase);

  log.info("Invoking tasks chain...");

  const rawResponse = await chain.invoke({
    ...userContext,
    format_instructions: parser.getFormatInstructions(),
  });

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
