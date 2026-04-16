import { z } from "zod";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { summarizePrompt } from "../prompts/summarize.prompt.js";

// Define schema
const schema = z.object({
  summary: z.string(),
});

// parser initialization:
const parser = StructuredOutputParser.fromZodSchema(schema);

// Create chain
export const createSummarizeChain = (llm) => {
  return RunnableSequence.from([
    summarizePrompt,
    llm,
    parser, // this enforces Zod schema
  ]);
};

// Execute summarize chain
export const summarize = async (text, llm) => {
  const chain = createSummarizeChain(llm);
  return chain.invoke({ text });
};