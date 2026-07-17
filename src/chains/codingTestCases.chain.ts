import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import z from "zod";

import { LlmWithConfig } from "../types/llmConfigType";
import { generateCodingTestCasesPrompt } from "../prompts";
import { codingProblemSchema } from "./codingTask.chain";

extendZodWithOpenApi(z);

const ioTestCaseSchema = z.object({
  input: z.string().describe("Judge input"),
  output: z.string().describe("Expected judge output"),
});

export const problemTestCasesSchema = z.object({
  public: z.array(ioTestCaseSchema).min(1).max(4),
  hidden: z.array(ioTestCaseSchema).min(3).max(10),
});

export const generateCodingTestCasesInputSchema = z
  .array(codingProblemSchema)
  .min(1)
  .max(5)
  .openapi("CodingTestCasesInput");

export const generateCodingTestCasesResponseSchema = z.object({
  testcases: z.array(problemTestCasesSchema).min(1).max(5),
});

const codingTestCasesParser = StructuredOutputParser.fromZodSchema(
  generateCodingTestCasesResponseSchema,
);

export type GenerateCodingTestCasesInputType = z.infer<
  typeof generateCodingTestCasesInputSchema
>;

export type GenerateCodingTestCasesResponseType = z.infer<
  typeof generateCodingTestCasesResponseSchema
>;

export const createCodingTestCasesChain = async (
  input: { codingProblems: GenerateCodingTestCasesInputType },
  llm: LlmWithConfig,
) => {
  const prompt = PromptTemplate.fromTemplate(generateCodingTestCasesPrompt);
  const structuredLlm = llm.withStructuredOutput(
    generateCodingTestCasesResponseSchema,
  );
  const chain = prompt.pipe(structuredLlm);

  const response = await chain.invoke({
    problems: JSON.stringify(input.codingProblems, null, 2),
    format_instructions: codingTestCasesParser.getFormatInstructions(),
  });

  return response;
};
