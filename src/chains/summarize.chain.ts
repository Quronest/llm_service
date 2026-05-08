import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { summarySchema, type SummaryResponse } from "../schemas/summarize.schema";
import { type LlmWithConfig } from "../types";

const parser = StructuredOutputParser.fromZodSchema(summarySchema);

const prompt = PromptTemplate.fromTemplate(`
Summarize the following text clearly and concisely.

Text:
{text}

Output format:
{format_instructions}

Return only valid JSON.
`);

export const summarize = async (
  text: string,
  llm: LlmWithConfig,
): Promise<SummaryResponse> => {
  const chain = RunnableSequence.from([
    prompt,
    llm.withConfig({
      response_format: { type: "json_object" },
    }),
    parser,
  ]);

  return (await chain.invoke({
    text,
    format_instructions: parser.getFormatInstructions(),
  })) as SummaryResponse;
};
