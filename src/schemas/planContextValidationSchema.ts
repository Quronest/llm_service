import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const planContextValidationSchema = z.object({
  title: z.string().openapi({
    description: "Title for the day's plan",
    example: "Day 1: Introduction to Web Development",
  }),
  description: z.string().openapi({
    description: "Description of the day's focus and objectives",
    example:
      "Understanding foundational concepts of HTTP, HTML, CSS, and basic JavaScript structure.",
  }),
  llm_context: z.string().openapi({
    description:
      "Day boundary context describing how much of the learning path this day should cover and how it connects to the previous and next days",
    example:
      "Focuses on static content. Tomorrow will introduce interactive DOM manipulation and fetching data.",
  }),
});

export type PlanContextValidationType = z.infer<
  typeof planContextValidationSchema
>;
