import { z } from "zod";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { getGroupPrompt } from "../prompts/getGroup.prompt.js";

const userGroupingSchema = z.object({
  group: z.enum(["A", "B", "C"]),
  summary: z.string(),
});

const parser = StructuredOutputParser.fromZodSchema(userGroupingSchema);

export const createGetUserGroupChain = (llm) => {
  return RunnableSequence.from([
    getGroupPrompt,
    llm,
    parser,
  ]);
};


export const getGroup = async (data, llm) => {
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
  const chain = createGetUserGroupChain(llm);
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