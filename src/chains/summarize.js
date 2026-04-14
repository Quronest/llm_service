import { z } from "zod";

const schema = z.object({
  summary: z.string(),
});

export async function summarize(text, llm) {
  const structured = llm.withStructuredOutput(schema);

  return structured.invoke(
    `Summarize the following:\n\n${text}`
  );
}