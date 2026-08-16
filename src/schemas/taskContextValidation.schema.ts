import z from "zod";

import {
  domainEnumList,
  levelEnumList,
  taskTypeEnumList,
  taskStatusEnumList,
} from "../enums";

export const taskContextValidationSchema = z.object({
  order: z.number().int().optional().nullable(),
  title: z.string(),
  description: z.string().optional().nullable(),
  task_type: z.enum(taskTypeEnumList).optional().nullable(),
  domain: z.enum(domainEnumList),
  subdomains: z.array(z.string()),
  tags: z.array(z.string()),
  level: z.enum(levelEnumList),
  content: z.any().optional().nullable(),
  status: z.enum(taskStatusEnumList).optional().nullable(),
  expected_total_minutes: z.number().optional().nullable(),
  actual_time_spent: z.number().optional().nullable(),
  progress_percent: z.number().optional().nullable(),
  is_optional: z.boolean().optional().nullable(),
  llm_context: z.string().optional().nullable(),
});

export type TaskContextValidationType = z.infer<
  typeof taskContextValidationSchema
>;
