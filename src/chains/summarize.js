import { z } from "zod";
import { llm } from "../llm/openai.js";

const schema = z.object({
  summary: z.string(),
});

export async function summarize(text) {
  const structured = llm.withStructuredOutput(schema);

  return structured.invoke(
    `Summarize the following:\n\n${text}`
  );
}