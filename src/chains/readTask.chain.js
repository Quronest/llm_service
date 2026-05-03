import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { createModuleLogger } from "../utils/logger.js";

const log = createModuleLogger(import.meta.url);

const urlSchema = z.object({
    name: z.string(),
    url: z.string()
});

const questionSchema = z.object({
    questionTitle: z.string(),
    options: z.array(z.string().min(1)).length(4),
    correctAnswerIndex: z.number().int().min(0).max(3),
    explanation: z.string().min(5)
});

const markdownSchema = z.object({
    text: z.string().min(1),
    image: z.string().url().optional(),
    youtube_video: z.string().url().optional() 
});

const contentSchema = z.object({
    content_markdown: markdownSchema,
    sources: z.array(urlSchema),
    ytvideo_summary: z.string().optional(),
    questions: z.array(questionSchema).min(3).max(5)
});

const parser = StructuredOutputParser.fromZodSchema(contentSchema);

const combinedSystemText = `

`;

const finalPrompt = PromptTemplate.fromTemplate(combinedSystemText);

export const createUserReadTaskChain = (llm) => {
  return RunnableSequence.from([
    finalPrompt,
    llm.withConfig({
      response_format: { type: "json_object" },
    }),
    parser,
  ]);
};

export const generateReadTasks =  async (data, llm) => {
    const { readingContext } = data;
    const { title, description, domain, tags = [], userJourneyContext = {}} = readingContext
    const chain = createUserReadTaskChain(llm);
    return await chain.invoke({
        title, 
        description,
        domain,
        tags: tags.join(", "),
        ...userJourneyContext,
        format_instructions: parser.getFormatInstructions()
    });
};