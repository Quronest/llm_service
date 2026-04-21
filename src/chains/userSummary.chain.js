import { z } from "zod";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { getGroupPrompt } from "../prompts/userSummary.prompt.js";

const userSummarySchema = z.object({
  group: z.enum(["A", "B", "C"]),
  phase: z.enum(["1", "2", "3"]),
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
  const { academic_data = {}, personal_data = {} } = data;

  const {
    institute,
    grade,
    course,
    courseDescription,
    interestedDomains = [],
    skills = [],
  } = academic_data;

  const { primaryGoal, experience, personalDescription } = personal_data;

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
