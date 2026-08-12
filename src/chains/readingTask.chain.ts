import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import z from "zod";

import { LlmWithConfig } from "../types/llmConfigType";
import { findUrlsPrompt, generateReadingTasksPrompt } from "../prompts";
import { TaskGenerateValidationType } from "../schemas/taskGenerateValidation.schema";
import { createModuleLogger } from "../utils/logger";
import { browserFetch } from "../tools/browserFetch.tool";
import { generateSlug } from "../utils/slug-utils";
import { levelEnumList } from "../enums";

const logger = createModuleLogger(import.meta.url);

type OriginalQuestionnaire =
  GenerateReadingTaskResponseType["questionnaires"][number];

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

export interface TransformedReadingTaskResponse extends Omit<
  GenerateReadingTaskResponseType,
  "questionnaires"
> {
  questionnaires: TransformedQuestionnaire[];
}

export const sourceSchema = z.object({
  name: z.string().describe("Name of the source"),
  url: z.string().url().describe("URL of the source"),
});

export const optionsSchema = z.object({
  id: z.number().describe("Unique identifier for the option"),
  text: z.string().describe("Text content of the option in markdown"),
});

export const questionnaireSchema = z.object({
  question_markdown: z.string().describe("Question in markdown"),
  level: z.enum(levelEnumList).describe("Level of the question"),
  options: z
    .array(optionsSchema)
    .length(4)
    .describe("Array of 4 answer options"),
  solution: z.number().describe("ID of the correct answer option"),
  explanation: z
    .string()
    .describe("Explanation of the correct answer in markdown"),
});

export const generateReadingTaskResponseSchema = z.object({
  markdown_content: z
    .string()
    .describe("Main reading content in markdown format"),
  sources: z
    .array(sourceSchema)
    .min(3)
    .max(5)
    .describe("List of 3-5 sources used"),
  youtube_video_summary: z
    .string()
    .optional()
    .describe("Summary of related YouTube video"),
  youtube_video_url: z
    .string()
    .optional()
    .describe("URL of related YouTube video"),
  questionnaires: z
    .array(questionnaireSchema)
    .min(3)
    .max(4)
    .describe("Array of 3-4 questionnaires"),
});

const urlExtractionSchema = z.object({
  urls: z
    .array(z.string().url())
    .min(5)
    .max(8)
    .describe("List of relevant URLs found based on the context"),
});

const urlExtractionParser =
  StructuredOutputParser.fromZodSchema(urlExtractionSchema);

const readingTaskParser = StructuredOutputParser.fromZodSchema(
  generateReadingTaskResponseSchema,
);

export type UrlExtractionSchemaType = z.infer<typeof urlExtractionSchema>;

export type GenerateReadingTaskResponseType = z.infer<
  typeof generateReadingTaskResponseSchema
>;

export function transformQuestionnaires(
  questionnaires: OriginalQuestionnaire[],
): TransformedQuestionnaire[] {
  return questionnaires.map((q: OriginalQuestionnaire, index: number) => {
    const options: TransformedOption[] = q.options.map((opt) => ({
      ...opt,
      slug: generateSlug(opt.text),
    }));

    const solutionOption = options.find((o) => o.id === q.solution) ?? null;

    return {
      id: index + 1,
      ...q,
      title: q.question_markdown,
      options,
      solution: solutionOption,
    };
  });
}

// We use LangGraph's Annotation API to define the state object that flows through our nodes.
export const GraphState = Annotation.Root({
  context: Annotation<string>(), // Initial input context
  urls: Annotation<string[]>({
    reducer: (state, update) => update,
    default: () => [],
  }),
  scrapedContent: Annotation<string[]>({
    reducer: (state, update) => update,
    default: () => [],
  }),
  finalOutput: Annotation<GenerateReadingTaskResponseType | null>({
    reducer: (state, update) => update,
    default: () => null,
  }),
});

export const createReadingTaskChain = async (
  input: { readingContext: TaskGenerateValidationType },
  llm: LlmWithConfig,
) => {
  const findUrlsNode = async (state: typeof GraphState.State) => {
    const prompt = PromptTemplate.fromTemplate(findUrlsPrompt);

    const structuredLlm = llm.withStructuredOutput(urlExtractionSchema);
    const chain = prompt.pipe(structuredLlm);

    const response: UrlExtractionSchemaType = await chain.invoke({
      context: state.context,
      format_instructions: urlExtractionParser.getFormatInstructions(),
    });
    return { urls: response.urls };
  };

  const scrapeUrlsNode = async (state: typeof GraphState.State) => {
    const contents: string[] = [];
    const successfulUrls: string[] = [];

    for (const url of state.urls) {
      try {
        const content = await browserFetch(
          url,
          "extract the main article text and key information",
        );

        contents.push(`Content from ${url}:\n${content}`);
        successfulUrls.push(url);
      } catch (err) {
        logger.warn(`Failed to process ${url}: ${err}`);
      }
    }

    return { contents, urls: successfulUrls };
  };

  const generateTaskNode = async (state: typeof GraphState.State) => {
    const prompt = PromptTemplate.fromTemplate(generateReadingTasksPrompt);

    const structuredLlm = llm.withStructuredOutput(
      generateReadingTaskResponseSchema,
    );
    const chain = prompt.pipe(structuredLlm);

    const response = await chain.invoke({
      context: state.context,
      scrapedContent: state.scrapedContent.join("\n\n---\n\n"),
      validUrls: JSON.stringify(state.urls),
      format_instructions: readingTaskParser.getFormatInstructions(),
    });
    console.log(response);
    
    const transformed: TransformedReadingTaskResponse = {
      ...response,
      questionnaires: transformQuestionnaires(response.questionnaires),
    };
    return { finalOutput: transformed };
  };

  const workflow = new StateGraph(GraphState)
    .addNode("findUrls", findUrlsNode)
    .addNode("scrapeUrls", scrapeUrlsNode)
    .addNode("generateTask", generateTaskNode)
    // Define the edges (the flow of execution)
    .addEdge(START, "findUrls")
    .addEdge("findUrls", "scrapeUrls")
    .addEdge("scrapeUrls", "generateTask")
    .addEdge("generateTask", END);

  const app = workflow.compile();

  const stringifiedContext = JSON.stringify(input.readingContext, null, 2);

  const finalState = await app.invoke({
    context: stringifiedContext,
  });

  return finalState.finalOutput;
};
