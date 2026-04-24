import { z } from "zod";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { getGroupPrompt } from "../prompts/userSummary.prompt.js";

const userSummarySchema = z.object({
  group: z.enum(["GROUP_A", "GROUP_B", "GROUP_C"]),
  phase: z.enum(["PHASE_1", "PHASE_2", "PHASE_3"]),
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
    institute_name,
    grade,
    course,
    description,
    interested_domains = [],
  } = academic_data;

  const { skills = [], primary_goal, experience } = personal_data;

  const chain = createUserSummaryChain(llm);

  return chain.invoke({
    institute_name,
    grade,
    course,
    description,
    interested_domains: interested_domains.join(", "),
    skills: skills.join(", "),
    primary_goal,
    experience,
    format_instructions: parser.getFormatInstructions(),
  });
};
