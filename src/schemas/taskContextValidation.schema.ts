import z from "zod";

import { domainEnumList } from "../enums/domain.enum";
import { levelEnumList } from "../enums/level.enum";

export const taskContextValidationSchema = z.object({
  title: z.string(),
  description: z.string(),
  llm_context: z.string(),
  domain: z.enum(domainEnumList),
  subdomains: z.array(z.string()),
  tags: z.array(z.string()),
  level: z.enum(levelEnumList),
  expected_total_minutes: z.number().min(1),
});

export type TaskContextValidationType = z.infer<
  typeof taskContextValidationSchema
>;
