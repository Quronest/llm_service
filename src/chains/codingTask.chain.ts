import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import z from "zod";

import { LlmWithConfig } from "../types/llmConfigType";
import { createCodingProblemsPrompt } from "../prompts";
import { TaskGenerateValidationType } from "../schemas/taskGenerateValidation.schema";
import { levelEnumList } from "../enums";

extendZodWithOpenApi(z);

const exampleSchema = z.object({
	input: z.string().describe("Sample input for the problem"),
	output: z.string().describe("Expected output for the sample input"),
});

const functionSignatureSchema = z.object({
	language: z.enum(levelEnumList).describe("Programming language for the solution"),
	functionName: z.string().describe("Expected function name"),
});

export const codingProblemSchema = z.object({
	title: z.string().describe("Problem title"),
	level: z.enum(levelEnumList).describe("Level of the question"),
	question_markdown: z.string().describe("Complete problem statement in markdown"),
	constraints: z
		.array(z.string())
		.min(1)
		.describe("Constraint lines for the problem"),
	time_limit: z.number().min(1).describe("Time limit in seconds"),
	memory_limit: z.number().min(32).describe("Memory limit in MB"),
	functionSignature: functionSignatureSchema,
	examples: z.array(exampleSchema).min(1).describe("Sample IO pairs"),
});

export const generateCodingProblemsResponseSchema = z.object({
	problems: z.array(codingProblemSchema).min(3).max(5),
});

const codingProblemsParser = StructuredOutputParser.fromZodSchema(
	generateCodingProblemsResponseSchema,
);

export type GenerateCodingProblemsResponseType = z.infer<
	typeof generateCodingProblemsResponseSchema
>;

export const createCodingProblemsChain = async (
	input: { codingContext: TaskGenerateValidationType },
	llm: LlmWithConfig,
) => {
	const stringifiedContext = JSON.stringify(input.codingContext, null, 2);
	const prompt = PromptTemplate.fromTemplate(createCodingProblemsPrompt);
	const structuredLlm = llm.withStructuredOutput(
		generateCodingProblemsResponseSchema,
	);
	const chain = prompt.pipe(structuredLlm);

	const response = await chain.invoke({
		context: stringifiedContext,
		format_instructions: codingProblemsParser.getFormatInstructions(),
	});

	return response;
};
