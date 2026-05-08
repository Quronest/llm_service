import { z } from "zod";

export const taskSchema = z.object({
  title: z.string(),
  type: z.enum(["READING", "QUIZ", "CODING", "DESCRIPTIVE"]),
  description: z.string(),
  expectedCompletionTime: z.string().min(1),
});

export const daySchema = z.object({
  title: z.string(),
  description: z.string(),
  tasks: z.array(taskSchema).min(3),
});

export const planSchema = z.object({
  plan: z.array(daySchema).length(7),
});

export type PlanResponse = z.infer<typeof planSchema>;
export type DayResponse = z.infer<typeof daySchema>;
export type TaskResponse = z.infer<typeof taskSchema>;
