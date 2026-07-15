import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import z from "zod";
import {
  questionnaireSchema,
  transformQuestionnaires,
} from "./readingTask.chain";
import { TaskGenerateValidationType } from "../schemas/taskGenerateValidation.schema";
import { LlmWithConfig } from "../types/llmConfigType";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { generateQuizTasksPrompt, createQuizPlanPrompt } from "../prompts";

export interface TransformedOption {
  id: number;
  text: string;
  slug: string;
}

export interface TransformedQuestionnaire {
  id: number;
  title: string;
  options: TransformedOption[];
  solution: TransformedOption | null;
  explanation: string;
}

export interface TransformedQuizTaskResponse {
  questionnaires: TransformedQuestionnaire[];
}

export const generateQuizTaskResponseSchema = z.object({
  questionnaires: z.array(questionnaireSchema).min(7).max(12),
});

export type GenerateQuizTaskResponseType = z.infer<
  typeof generateQuizTaskResponseSchema
>;

const quizTaskParser = StructuredOutputParser.fromZodSchema(
  generateQuizTaskResponseSchema,
);

export const GraphState = Annotation.Root({
  context: Annotation<string>(), // Initial input context
  plan: Annotation<string>({
    reducer: (state, update) => update,
    default: () => "",
  }),
  finalOutput: Annotation<GenerateQuizTaskResponseType | null>({
    reducer: (state, update) => update,
    default: () => null,
  }),
});

export const createQuizTaskChain = async (
  input: { quizContext: TaskGenerateValidationType },
  llm: LlmWithConfig,
) => {
  const creatPlanNode = async (state: typeof GraphState.State) => {
    const prompt = PromptTemplate.fromTemplate(createQuizPlanPrompt);

    const structuredLlm = llm.withStructuredOutput(z.string());

    const chain = prompt.pipe(structuredLlm);

    const response = await chain.invoke({
      context: state.context,
    });
    return { plan: response };
  };

  const generateTaskNode = async (state: typeof GraphState.State) => {
    const prompt = PromptTemplate.fromTemplate(generateQuizTasksPrompt);

    const structuredLlm = llm.withStructuredOutput(
      generateQuizTaskResponseSchema,
    );

    const chain = prompt.pipe(structuredLlm);

    const response = await chain.invoke({
      context: state.context,
      plan: state.plan,
      format_instructions: quizTaskParser.getFormatInstructions(),
    });

    const transformed: TransformedQuizTaskResponse = {
      questionnaires: transformQuestionnaires(response.questionnaires),
    };

    return { finalOutput: transformed };
  };

  const workflow = new StateGraph(GraphState)
    .addNode("createPlan", creatPlanNode)
    .addNode("generateTask", generateTaskNode)
    .addEdge(START, "createPlan")
    .addEdge("createPlan", "generateTask")
    .addEdge("generateTask", END);

  const app = workflow.compile();
  const stringifiedContext = JSON.stringify(input.quizContext, null, 2);

  const finalState = await app.invoke({
    context: stringifiedContext,
  });
  return finalState.finalOutput;
};
