import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import z from "zod";
import { LlmWithConfig } from "../types/llmConfigType";
import { ChatPromptTemplate } from "@langchain/core/prompts";

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

export type GenerateReadingTaskResponseType = z.infer<
  typeof generateReadingTaskResponseSchema
>;

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
  input: { readingContext: any },
  llm: LlmWithConfig,
) => {
  const findUrlsNode = async (state: typeof GraphState.State) => {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are an expert researcher. Based on the given context, identify 3 to 5 highly relevant and authoritative web URLs that would contain detailed information about this topic. Return ONLY real, valid URLs.",
      ],
      ["human", "Context: {context}"],
    ]);

    const structuredLlm = (llm as any).withStructuredOutput(
      urlExtractionSchema,
    );
    const chain = prompt.pipe(structuredLlm);

    const response = await chain.invoke({ context: state.context });
    return { urls: (response as z.infer<typeof urlExtractionSchema>).urls };
  };

  const scrapeUrlsNode = async (state: typeof GraphState.State) => {
    const contents: string[] = [];

    for (const url of state.urls) {
      try {
        const response = await fetch(url);
        const html = await response.text();

        // Very basic extraction: grabbing text and stripping HTML.
        // For production, consider using 'cheerio' to parse only <p>, <article>, etc.
        const cleanText = html.replace(/<[^>]*>?/gm, "").substring(0, 5000);
        contents.push(`Content from ${url}:\n${cleanText}`);
      } catch (error) {
        console.warn(`Failed to fetch ${url}:`, error);
      }
    }
    return { scrapedContent: contents };
  };

  const generateTaskNode = async (state: typeof GraphState.State) => {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are an expert curriculum designer. Using the original context and the scraped web content, generate a comprehensive reading task. You must follow the requested JSON schema perfectly.",
      ],
      [
        "human",
        "Original Context: {context}\n\nScraped Material:\n{scrapedContent}",
      ],
    ]);

    const structuredLlm = (llm as any).withStructuredOutput(
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
