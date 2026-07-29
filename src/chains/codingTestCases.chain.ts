import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { PromptTemplate } from "@langchain/core/prompts";
import z from "zod";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createAgent } from "langchain";
import { LlmWithConfig } from "../types/llmConfigType";
import {
  codingProblemSchema,
} from "./codingTask.chain";
import logger from "../utils/logger";
import geminiLLM from "../llm/gemini.llm";
import { mcpClient } from "../mcp/client";
import {
  generateCodingTestCasesPrompt,
  resolveCodingSolutionPrompt,
} from "../prompts";
import { executeOnJudge0 } from "../tools/executeCode.tool";

extendZodWithOpenApi(z);

const ioTestCaseSchema = z.object({
  input: z.string().describe("Judge input"),
  output: z.string().describe("Expected judge output"),
});

export const problemTestCasesSchema = z.array(ioTestCaseSchema);

export const generateCodingTestCasesInputSchema = codingProblemSchema;

export const generateCodingTestCasesResponseSchema = problemTestCasesSchema;

export type GenerateCodingTestCasesInputType = z.infer<
  typeof generateCodingTestCasesInputSchema
>;

export type GenerateCodingTestCasesResponseType = z.infer<
  typeof generateCodingTestCasesResponseSchema
>;

type InputsSet = { publicInputs: string[]; hiddenInputs: string[] };

export const TestCaseGraphState = Annotation.Root({
  codingProblem: Annotation<GenerateCodingTestCasesInputType>(),
  canonicalSolution: Annotation<string>({
    reducer: (state, update) => update,
    default: () => "",
  }),
  testcaseInputs: Annotation<InputsSet>({
    reducer: (state, update) => update,
    default: () => ({ publicInputs: [], hiddenInputs: [] }),
  }),
  finalOutput: Annotation<GenerateCodingTestCasesResponseType | null>({
    reducer: (state, update) => update,
    default: () => null,
  }),
});

export const createCodingTestCasesChain = async (
  input: { codingProblem: GenerateCodingTestCasesInputType },
  llm: LlmWithConfig,
) => {
  const dynamicMcpTools = await mcpClient.getTools();
  logger.info(
    `Loaded ${dynamicMcpTools.length} dynamic tool(s) from MCP Server`,
  );

  const resolveSolutionsWithMCPNode = async (
    state: typeof TestCaseGraphState.State,
  ) => {
    let canonicalSolution = "";
    const llm = geminiLLM();
    // Create a dynamic sub-agent equipped with MCP tools
    const mcpAgent = createAgent({
      model: llm,
      tools: dynamicMcpTools,
    });

    const problem = state.codingProblem;
    logger.info(`Resolving optimal Python solution for: "${problem.title}"`);

    const agentPromptTemplate = PromptTemplate.fromTemplate(
      resolveCodingSolutionPrompt,
    );
    const agentPrompt = await agentPromptTemplate.format(problem);

    const result = await mcpAgent.invoke({
      messages: [new HumanMessage(agentPrompt)],
    });

    const rawContent = result.messages.at(-1)?.content;
    const solutionCode =
      typeof rawContent === "string" ? rawContent.trim() : "";

    // Clean backtick fences if model included them
    const cleanedCode = solutionCode
      .replace(/^```python/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    canonicalSolution = cleanedCode;

    return { canonicalSolution };
  };

  const generateInputsNode = async (state: typeof TestCaseGraphState.State) => {
    const inputsSchema = z.object({
      publicInputs: z
        .array(z.string())
        .min(1)
        .max(4)
        .describe("Raw stdin strings for basic public examples"),
      hiddenInputs: z
        .array(z.string())
        .min(3)
        .max(10)
        .describe("Raw stdin strings for boundary edge cases"),
    });

    const prompt = PromptTemplate.fromTemplate(generateCodingTestCasesPrompt);

    const structuredLlm = llm.withStructuredOutput(inputsSchema);
    const chain = prompt.pipe(structuredLlm);
    const problem = state.codingProblem;
    const response = await chain.invoke({
      title: problem.title,
      constraints: problem.constraints.join("\n"),
      examples: JSON.stringify(problem.examples),
      solutionSnippet: (state.canonicalSolution || "").slice(0, 300),
    });

    return { testcaseInputs: response };
  };

  const executeJudgeNode = async (state: typeof TestCaseGraphState.State) => {
    const sourceCode = state.canonicalSolution || "";
    const inputsSet = state.testcaseInputs;

    if (!inputsSet) {
      logger.warn(`No inputs found for problem`);
      return { finalOutput: [] };
    }

    logger.info(
      `Executing solution on Judge0 for problem: "${state.codingProblem.title}"`,
    );

    // Run public cases concurrently
    const publicResults = await Promise.all(
      (inputsSet.publicInputs || []).map(async (stdin) => {
        const stdout = await executeOnJudge0(sourceCode, stdin);
        return { input: stdin, output: stdout };
      }),
    );

    // Run hidden cases concurrently
    const hiddenResults = await Promise.all(
      (inputsSet.hiddenInputs || []).map(async (stdin) => {
        const stdout = await executeOnJudge0(sourceCode, stdin);
        return { input: stdin, output: stdout };
      }),
    );

    const finalOutput = [
      ...publicResults,
      ...hiddenResults,
    ].filter((r) => r.output !== "JUDGE_ERROR");

    return { finalOutput };
  };

  const workflow = new StateGraph(TestCaseGraphState)
    .addNode("resolveSolutionsWithMCP", resolveSolutionsWithMCPNode)
    .addNode("generateInputs", generateInputsNode)
    .addNode("executeJudge", executeJudgeNode)
    .addEdge(START, "resolveSolutionsWithMCP")
    .addEdge("resolveSolutionsWithMCP", "generateInputs")
    .addEdge("generateInputs", "executeJudge")
    .addEdge("executeJudge", END);

  const app = workflow.compile();

  const finalState = await app.invoke({
    codingProblem: input.codingProblem,
  });

  return finalState.finalOutput;
};
