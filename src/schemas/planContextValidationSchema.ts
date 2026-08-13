import { z } from "zod";

export const planContextValidationSchema = z.object({
  title: z.string(),
  description: z.string(),
  llm_context: z.string(),
});

export type PlanContextValidationType = z.infer<
  typeof planContextValidationSchema
>;
