import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import z from "zod";

import { HumanMessage } from "@langchain/core/messages";
import { createAgent } from "langchain";
import { LlmWithConfig } from "../types/llmConfigType";
import {
  createCodingProblemsPrompt,
  findCodingProblemUrlsPrompt,
} from "../prompts";
import { TaskGenerateValidationType } from "../schemas/taskGenerateValidation.schema";
import { languageEnumList, levelEnumList } from "../enums";
import { extractURLText } from "../tools/extractURLText.tool";
import { browserFetch } from "../tools/browserFetch.tool";
import logger, { createModuleLogger } from "../utils/logger";
import { urlsContextParser } from "../utils/urlContextParser";
import { searchTool } from "../tools/search.tool";
import { mcpClient } from "../mcp/client";
import geminiLLM from "../llm/gemini.llm";

extendZodWithOpenApi(z);

const log = createModuleLogger(import.meta.url);

const exampleSchema = z.object({
  input: z.string().describe("Sample input for the problem"),
  output: z.string().describe("Expected output for the sample input"),
});

const functionSignatureSchema = z.object({
  language: z
    .enum(languageEnumList)
    .describe("Programming language for the solution"),
  functionName: z.string().describe("Expected function name"),
});

export const codingProblemSchema = z.object({
  title: z.string().describe("Problem title"),
  level: z.enum(levelEnumList).describe("Level of the question"),
  question_markdown: z
    .string()
    .describe("Complete problem statement in markdown"),
  source_url: z
    .string()
    .url()
    .describe("Public source URL for the original problem"),
  constraints: z
    .array(z.string())
    .min(1)
    .describe("Constraint lines for the problem"),
  time_limit: z.number().min(1).describe("Time limit in seconds"),
  memory_limit: z.number().min(32).describe("Memory limit in MB"),
  function_signature: functionSignatureSchema,
  examples: z.array(exampleSchema).min(1).describe("Sample IO pairs"),
});

export const generateCodingProblemsResponseSchema = z.object({
  problems: z.array(codingProblemSchema).min(1).max(3),
});

const buildGenerateCodingProblemsResponseSchema = (questionCount: number) =>
  z.object({
    problems: z.array(codingProblemSchema).length(questionCount),
  });

const codingProblemsParser = StructuredOutputParser.fromZodSchema(
  generateCodingProblemsResponseSchema,
);

export type GenerateCodingProblemsResponseType = z.infer<
  typeof generateCodingProblemsResponseSchema
>;

type ScrapedSource = {
  url: string;
  content: string;
};

export const codingUrlExtractionSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(3),
  questionCount: z
    .number()
    .min(1)
    .max(3)
    .describe(
      "The number of coding problems to generate (between 1 and 3), decided according to the topic complexity and user context",
    ),
});

const codingUrlExtractionParser = StructuredOutputParser.fromZodSchema(
  codingUrlExtractionSchema,
);

export const GraphState = Annotation.Root({
  context: Annotation<string>(),
  searchQuery: Annotation<string>({
    reducer: (state, update) => update,
    default: () => "",
  }),
  searchResults: Annotation<any[]>({
    reducer: (state, update) => update,
    default: () => [],
  }),
  questionCount: Annotation<number>({
    reducer: (state, update) => update,
    default: () => 1,
  }),
  urls: Annotation<string[]>({
    reducer: (state, update) => update,
    default: () => [],
  }),
  scrapedSources: Annotation<ScrapedSource[]>({
    reducer: (state, update) => update,
    default: () => [],
  }),
  finalOutput: Annotation<GenerateCodingProblemsResponseType | null>({
    reducer: (state, update) => update,
    default: () => null,
  }),
});

export const createCodingProblemsChain = async (
  input: { codingContext: TaskGenerateValidationType },
  llm: LlmWithConfig,
) => {
  let dynamicMcpTools: any[] = [];
  try {
    dynamicMcpTools = await mcpClient.getTools();
    logger.info(
      `Loaded ${dynamicMcpTools.length} dynamic tool(s) from MCP Server`,
    );
  } catch (error) {
    logger.warn(`Failed to load dynamic tools from MCP Server: ${error}`);
  }

  const searchAndSelectUrlsNode = async (state: typeof GraphState.State) => {
    
    const llm = geminiLLM(); 

    const mcpAgent = createAgent({
      model: llm,
      tools: dynamicMcpTools,
    });

    logger.info(`Searching and selecting coding problem URLs using mcpAgent`);

    const agentPromptTemplate = PromptTemplate.fromTemplate(
      findCodingProblemUrlsPrompt,
    );
    const agentPrompt = await agentPromptTemplate.format({
      context: state.context,
      format_instructions: codingUrlExtractionParser.getFormatInstructions(),
    });

    const result = await mcpAgent.invoke({
      messages: [new HumanMessage(agentPrompt)],
    });

    const rawContent = result.messages.at(-1)?.content;
    const contentString =
      typeof rawContent === "string" ? rawContent.trim() : "";

    let selectResponse: z.infer<typeof codingUrlExtractionSchema>;
    try {
      selectResponse = await codingUrlExtractionParser.parse(contentString);
    } catch (parseError) {
      logger.warn(
        `Failed to parse structured output with LangChain parser: ${parseError}. Trying custom JSON extraction.`,
      );
      try {
        // Strip markdown code fences if present
        const cleanContent = contentString
          .replace(/```json/i, "")
          .replace(/```/g, "")
          .trim();
        selectResponse = JSON.parse(cleanContent);
      } catch (fallbackError) {
        logger.error(`Fallback JSON parsing also failed: ${fallbackError}`);
        throw new Error(
          `Failed to parse URL extraction response: ${contentString}`,
        );
      }
    }

    return {
      searchQuery: "",
      searchResults: [],
      urls: selectResponse.urls,
      questionCount: selectResponse.questionCount,
    };
  };

  const scrapeUrlsNode = async (state: typeof GraphState.State) => {
    const scrapedSources: ScrapedSource[] = [];
    const successfulUrls: string[] = [];

    for (const url of state.urls) {
      if (successfulUrls.length >= state.questionCount) break;
      try {
        const html = await browserFetch(url);
        const filteredText = extractURLText(html);

        if (filteredText.trim().length < 200) {
          continue;
        }

        scrapedSources.push({
          url,
          content: filteredText,
        });
        successfulUrls.push(url);
      } catch (err) {
        log.warn(`Failed to process ${url}: ${err}`);
      }
    }

    return {
      scrapedSources,
      urls: successfulUrls,
      questionCount: Math.min(state.questionCount, successfulUrls.length),
    };
  };

  const generateTaskNode = async (state: typeof GraphState.State) => {
    const prompt = PromptTemplate.fromTemplate(createCodingProblemsPrompt);
    const structuredLlm = llm.withStructuredOutput(
      buildGenerateCodingProblemsResponseSchema(state.questionCount),
    );
    const chain = prompt.pipe(structuredLlm);

    const response = await chain.invoke({
      context: state.context,
      questionCount: state.questionCount,
      scrapedContent: urlsContextParser(state.scrapedSources),
      validUrls: JSON.stringify(state.urls),
      format_instructions: codingProblemsParser.getFormatInstructions(),
    });

    return { finalOutput: response };
  };

  const workflow = new StateGraph(GraphState)
    .addNode("searchAndSelectUrls", searchAndSelectUrlsNode)
    .addNode("scrapeUrls", scrapeUrlsNode)
    .addNode("generateTask", generateTaskNode)
    .addEdge(START, "searchAndSelectUrls")
    .addEdge("searchAndSelectUrls", "scrapeUrls")
    .addEdge("scrapeUrls", "generateTask")
    .addEdge("generateTask", END);

  const app = workflow.compile();
  const stringifiedContext = JSON.stringify(input.codingContext, null, 2);

  const finalState = await app.invoke({
    context: stringifiedContext,
  });

  return finalState.finalOutput;
};
