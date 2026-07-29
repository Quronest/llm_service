import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import z from "zod";

import { LlmWithConfig } from "../types/llmConfigType";
import {
  createCodingProblemsPrompt,
  generateSearchQueryPrompt,
  selectCodingProblemUrlsPrompt,
} from "../prompts";
import { TaskGenerateValidationType } from "../schemas/taskGenerateValidation.schema";
import { languageEnumList, levelEnumList } from "../enums";
import { extractURLText } from "../tools/extractURLText.tool";
import { browserFetch } from "../tools/browserFetch.tool";
import logger, { createModuleLogger } from "../utils/logger";
import { urlsContextParser } from "../utils/urlContextParser";
import { searchTool } from "../tools/search.tool";
import { mcpClient } from "../mcp/client";

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

  const generateSearchQueryNode = async (state: typeof GraphState.State) => {
    const prompt = PromptTemplate.fromTemplate(generateSearchQueryPrompt);
    const schema = z.object({
      searchQuery: z
        .string()
        .describe("The exact search query string to execute"),
    });
    const generateSearchQueryParser =
      StructuredOutputParser.fromZodSchema(schema);

    const structuredLlm = llm.withStructuredOutput(schema);
    const chain = prompt.pipe(structuredLlm);

    const response = await chain.invoke({
      context: state.context,
      format_instructions: generateSearchQueryParser.getFormatInstructions(),
    });
    logger.info(`Generated Search Query: "${response.searchQuery}"`);

    return { searchQuery: response.searchQuery };
  };

  const executeSearchNode = async (state: typeof GraphState.State) => {
    let results: any[] = [];
    try {
      const mcpWebSearch = dynamicMcpTools.find(
        (tool) => tool.name === "web_search",
      );

      let rawResults: any;
      if (mcpWebSearch) {
        logger.info(`Searching web via MCP for query: "${state.searchQuery}"`);
        rawResults = await mcpWebSearch.invoke({ query: state.searchQuery });
      } else {
        logger.info(
          `Searching web via fallback searchTool for query: "${state.searchQuery}"`,
        );
        rawResults = await searchTool.invoke({ query: state.searchQuery });
      }

      results =
        typeof rawResults === "string" ? JSON.parse(rawResults) : rawResults;
    } catch (error) {
      logger.warn(
        `Search tool invocation failed: ${error}. Falling back to empty results.`,
      );
      results = [
        {
          snippet:
            "Search unavailable. Rely on your standard, verified competitive programming problem URLs for this topic.",
        },
      ];
    }

    return { searchResults: results };
  };

  const selectUrlsNode = async (state: typeof GraphState.State) => {
    const prompt = PromptTemplate.fromTemplate(selectCodingProblemUrlsPrompt);
    const structuredLlm = llm.withStructuredOutput(codingUrlExtractionSchema);
    const chain = prompt.pipe(structuredLlm);

    const response = await chain.invoke({
      context: state.context,
      search_results: JSON.stringify(state.searchResults),
      format_instructions: codingUrlExtractionParser.getFormatInstructions(),
    });

    return { urls: response.urls, questionCount: response.questionCount };
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
    .addNode("generateSearchQuery", generateSearchQueryNode)
    .addNode("executeSearch", executeSearchNode)
    .addNode("selectUrls", selectUrlsNode)
    .addNode("scrapeUrls", scrapeUrlsNode)
    .addNode("generateTask", generateTaskNode)
    .addEdge(START, "generateSearchQuery")
    .addEdge("generateSearchQuery", "executeSearch")
    .addEdge("executeSearch", "selectUrls")
    .addEdge("selectUrls", "scrapeUrls")
    .addEdge("scrapeUrls", "generateTask")
    .addEdge("generateTask", END);

  const app = workflow.compile();
  const stringifiedContext = JSON.stringify(input.codingContext, null, 2);

  const finalState = await app.invoke({
    context: stringifiedContext,
  });

  return finalState.finalOutput;
};
