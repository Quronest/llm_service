import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import z from "zod";

import { LlmWithConfig } from "../types/llmConfigType";
import {
	createCodingProblemsPrompt,
	findCodingProblemUrlsPrompt,
} from "../prompts";
import { TaskGenerateValidationType } from "../schemas/taskGenerateValidation.schema";
import { languageEnumList, levelEnumList } from "../enums";
import { extractURLText } from "../tools/extractURLText.tool";
import { createModuleLogger } from "../utils/logger";

extendZodWithOpenApi(z);

const log = createModuleLogger(import.meta.url);

const exampleSchema = z.object({
	input: z.string().describe("Sample input for the problem"),
	output: z.string().describe("Expected output for the sample input"),
});

const functionSignatureSchema = z.object({
	language: z.enum(languageEnumList).describe("Programming language for the solution"),
	functionName: z.string().describe("Expected function name"),
});

export const codingProblemSchema = z.object({
	title: z.string().describe("Problem title"),
	level: z.enum(levelEnumList).describe("Level of the question"),
	question_markdown: z.string().describe("Complete problem statement in markdown"),
	source_url: z.url().describe("Public source URL for the original problem"),
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

const getQuestionCountForLevel = (level: TaskGenerateValidationType["task_context"]["level"]) => {
	switch (level) {
		case "EASY":
			return 1;
		case "MEDIUM":
			return 2;
		case "HARD":
			return 3;
		default:
			return 1;
	}
};

export const codingUrlExtractionSchema = z.object({
	urls: z.array(z.url()).min(3).max(8),
});

const codingUrlExtractionParser = StructuredOutputParser.fromZodSchema(
	codingUrlExtractionSchema,
);

export const GraphState = Annotation.Root({
	context: Annotation<string>(),
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
	const getQuestionCountNode = async (state: typeof GraphState.State) => {
		const decodedContext = JSON.parse(state.context) as TaskGenerateValidationType;
		return {
			questionCount: getQuestionCountForLevel(
				decodedContext.task_context.level,
			),
		};
	};

	const findUrlsNode = async (state: typeof GraphState.State) => {
		const prompt = PromptTemplate.fromTemplate(findCodingProblemUrlsPrompt);
		const structuredLlm = llm.withStructuredOutput(codingUrlExtractionSchema);
		const chain = prompt.pipe(structuredLlm);

		const response = await chain.invoke({
			context: state.context,
			questionCount: state.questionCount,
			format_instructions: codingUrlExtractionParser.getFormatInstructions(),
		});

		return { urls: response.urls };
	};

	const scrapeUrlsNode = async (state: typeof GraphState.State) => {
		const scrapedSources: ScrapedSource[] = [];
		const successfulUrls: string[] = [];

		for (const url of state.urls) {
			try {
				const response = await fetch(url);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const html = await response.text();
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

		return { scrapedSources, urls: successfulUrls };
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
			scrapedContent: state.scrapedSources
				.map((source, index) =>
					`Source ${index + 1}: ${source.url}\n${source.content}`,
				)
				.join("\n\n---\n\n"),
			validUrls: JSON.stringify(state.urls),
			format_instructions: codingProblemsParser.getFormatInstructions(),
		});

		return { finalOutput: response };
	};

	const workflow = new StateGraph(GraphState)
		.addNode("getQuestionCount", getQuestionCountNode)
		.addNode("findUrls", findUrlsNode)
		.addNode("scrapeUrls", scrapeUrlsNode)
		.addNode("generateTask", generateTaskNode)
		.addEdge(START, "getQuestionCount")
		.addEdge("getQuestionCount", "findUrls")
		.addEdge("findUrls", "scrapeUrls")
		.addEdge("scrapeUrls", "generateTask")
		.addEdge("generateTask", END);

	const app = workflow.compile();
	const stringifiedContext = JSON.stringify(input.codingContext, null, 2);

	const finalState = await app.invoke({
		context: stringifiedContext,
	});

	return finalState.finalOutput;
};
