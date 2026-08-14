import { HumanMessage } from "@langchain/core/messages";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { createAgent } from "langchain";
import z from "zod";

import { languageEnumList, levelEnumList } from "../enums";
import geminiLLM from "../llm/gemini.llm";
import { mcpClient } from "../mcp/client";
import {
  createCodingProblemsPrompt,
  findCodingProblemUrlsPrompt,
} from "../prompts";
import { TaskGenerateValidationType } from "../schemas/taskGenerateValidation.schema";
import { browserFetch } from "../tools/browserFetch.tool";
import { LlmWithConfig } from "../types/llmConfigType";
import logger, { createModuleLogger } from "../utils/logger";
import { urlsContextParser } from "../utils/urlContextParser";

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
    const gemLLM = geminiLLM();

    let resultMessagesContent = "";
    try {
      const mcpAgent = createAgent({
        model: gemLLM,
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
      if (typeof rawContent === "string") {
        resultMessagesContent = rawContent.trim();
      } else if (Array.isArray(rawContent)) {
        resultMessagesContent = rawContent
          .map((c: any) => (typeof c === "string" ? c : c?.text || ""))
          .join("\n")
          .trim();
      }
    } catch (agentErr) {
      logger.warn(`mcpAgent execution encountered issue: ${agentErr}`);
    }

    let selectResponse: z.infer<typeof codingUrlExtractionSchema> | null = null;
    if (resultMessagesContent) {
      try {
        selectResponse = await codingUrlExtractionParser.parse(resultMessagesContent);
      } catch (parseError) {
        logger.warn(
          `Failed to parse structured output with LangChain parser: ${parseError}. Trying regex extraction.`,
        );
        const jsonMatch = resultMessagesContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            selectResponse = codingUrlExtractionSchema.parse(parsed);
          } catch (jsonErr) {
            logger.warn(`Regex JSON parse failed: ${jsonErr}`);
          }
        }
      }
    }

    // Direct structured LLM fallback if agent didn't return valid schema
    if (!selectResponse) {
      logger.info("Falling back to direct structured LLM for URL selection");
      const structuredLlm = gemLLM.withStructuredOutput(codingUrlExtractionSchema);
      const agentPromptTemplate = PromptTemplate.fromTemplate(
        findCodingProblemUrlsPrompt,
      );
      const agentPrompt = await agentPromptTemplate.format({
        context: state.context,
        format_instructions: codingUrlExtractionParser.getFormatInstructions(),
      });
      selectResponse = await structuredLlm.invoke(agentPrompt);
    }

    return {
      searchQuery: "",
      searchResults: [],
      urls: selectResponse.urls,
      questionCount: Math.max(1, selectResponse.questionCount || 1),
    };
  };

  const scrapeUrlsNode = async (state: typeof GraphState.State) => {
    const scrapedSources: ScrapedSource[] = [];
    const targetCount = Math.max(1, state.questionCount || 1);

    for (const url of state.urls) {
      if (scrapedSources.length >= targetCount) break;
      try {
        const content = await browserFetch(
          url,
          "extract the coding problem description, title, constraints, memory limit, time limit, and sample inputs/outputs",
        );

        if (content && content.trim().length >= 50) {
          scrapedSources.push({
            url,
            content,
          });
        }
      } catch (err) {
        log.warn(`Failed to process ${url}: ${err}`);
      }
    }

    return {
      scrapedSources,
      urls: state.urls,
      questionCount: targetCount,
    };
  };

  const generateTaskNode = async (state: typeof GraphState.State) => {
    const count = Math.max(1, state.questionCount || 1);
    const prompt = PromptTemplate.fromTemplate(createCodingProblemsPrompt);
    const structuredLlm = llm.withStructuredOutput(
      buildGenerateCodingProblemsResponseSchema(count),
    );
    const chain = prompt.pipe(structuredLlm);

    const response = await chain.invoke({
      context: state.context,
      questionCount: count,
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
