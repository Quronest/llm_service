import { z } from "zod";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { getGroupPrompt } from "../prompts/userSummary.prompt.js";

const userSummarySchema = z.object({
  group: z.enum(["A", "B", "C"]),
  summary: z.string(),
});

const parser = StructuredOutputParser.fromZodSchema(userSummarySchema);

export const createUserSummaryChain = (llm) => {
  return RunnableSequence.from([
    getGroupPrompt,
    llm.withConfig({
      response_format: { type: "json_object" }, // Force JSON output
    }),
    parser,
  ]);
};

export const generateUserSummary = async (data, llm) => {
  const {
    institute,
    grade,
    course,
    courseDescription,
    interestedDomains,
    skills,
    primaryGoal,
    experience,
    personalDescription,
  } = data;

  const chain = createUserSummaryChain(llm);

  return chain.invoke({
    institute,
    grade,
    course,
    courseDescription,
    interestedDomains: interestedDomains.join(", "),
    skills: skills.join(", "),
    primaryGoal,
    experience,
    personalDescription,
    format_instructions: parser.getFormatInstructions(),
  });
};
