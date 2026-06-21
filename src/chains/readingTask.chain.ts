import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import z from "zod";
import { LlmWithConfig } from "../types/llmConfigType";
import { PromptTemplate } from "@langchain/core/prompts";
import { findUrlsPrompt } from "../prompts/findUrls.prompt";
import { generateReadingTasksPrompt } from "../prompts/generateReadingTasks.prompt";
import { ReadingTaskContextValidationType } from "../schemas/readingTaskContext.schema";
import { createModuleLogger } from "../utils/logger";
import { GoogleGenAI } from "@google/genai";

const log = createModuleLogger(import.meta.url);

export const sourceSchema = z.object({
  name: z.string(),
  url: z.url(),
});

export const questionnaireSchema = z.object({
  question_title: z.string(),

  options: z.array(z.string()).length(4, "Exactly 4 options required"),

  solution: z.string(),

  explanation: z.string(),
});

export const generateReadingTaskResponseSchema = z.object({
  markdown_content: z.string(),

  sources: z.array(sourceSchema).min(3),

  youtube_video_summary: z.string().optional(),
  youtube_video_url: z.string().optional(),

  questionnaires: z.array(questionnaireSchema).min(3).max(4),
});

const urlExtractionSchema = z.object({
  urls: z
    .array(z.url())
    .describe("List of relevant URLs found based on the context"),
});

export type UrlExtractionSchemaType = z.infer<typeof urlExtractionSchema>;

export type GenerateReadingTaskResponseType = z.infer<
  typeof generateReadingTaskResponseSchema
>;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

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
  input: { readingContext: ReadingTaskContextValidationType },
  llm: LlmWithConfig,
) => {
  const findUrlsNode = async (state: typeof GraphState.State) => {
    const prompt = PromptTemplate.fromTemplate(findUrlsPrompt);

    const structuredLlm = llm.withStructuredOutput(urlExtractionSchema);
    const chain = prompt.pipe(structuredLlm);

    const response: UrlExtractionSchemaType = await chain.invoke({
      context: state.context,
    });
    return { urls: response.urls };
  };

  const scrapeUrlsNode = async (state: typeof GraphState.State) => {
    const contents: string[] = [];

    for (const url of state.urls) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-pro",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Read the content from this webpage and extract all the important information.\n\n${url}`,
                },
              ],
            },
          ],
          config: {
            tools: [
              {
                urlContext: {},
              },
            ],
          },
        });

        contents.push(`Content from ${url}:\n${response.text}`);
      } catch (err) {
        log.warn(`Failed to process ${url}: ${err}`);
      }
    }

    return {
      scrapedContent: contents,
    };
  };

  const generateTaskNode = async (state: typeof GraphState.State) => {
    const prompt = PromptTemplate.fromTemplate(generateReadingTasksPrompt);

    const structuredLlm = llm.withStructuredOutput(
      generateReadingTaskResponseSchema,
    );
    const chain = prompt.pipe(structuredLlm);

    // Join the array of scraped contents into a single string for the prompt
    const response = await chain.invoke({
      context: state.context,
      scrapedContent: state.scrapedContent.join("\n\n---\n\n"),
    });

    return { finalOutput: response };
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
