import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import type { RunnableLike } from "@langchain/core/runnables";
import { z } from "zod";
import { LlmWithConfig } from "../types/llmConfigType";

const summarySchema = z.object({
  summary: z.string(),
});

const parser = StructuredOutputParser.fromZodSchema(summarySchema);

const prompt = PromptTemplate.fromTemplate(`
Summarize the following text clearly and concisely.

Text:
{text}

Output format:
{format_instructions}

Return only valid JSON.
`);

export const summarize = async (text: string, llm: LlmWithConfig) => {
  const chain = RunnableSequence.from([
    prompt,
    llm.withConfig({
      response_format: { type: "json_object" },
    }),
    parser,
  ]);

  return chain.invoke({
    text,
    format_instructions: parser.getFormatInstructions(),
  });
};
