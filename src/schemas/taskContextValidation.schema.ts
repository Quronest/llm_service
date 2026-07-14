import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { domain, domainEnumList } from "../enums/domain.enum";
import { level, levelEnumList } from "../enums/level.enum";

extendZodWithOpenApi(z);

export const taskContextValidationSchema = z.object({
  title: z.string().openapi({
    example: "Frontend Development basics",
  }),
  description: z.string().openapi({
    example:
      "Currently pursuing engineering degree with focus on web development and cloud technologies.",
  }),
  llm_context: z.string().openapi({
    example:
      "Covers the first half of the day with foundational explanation, then hands off to practice-oriented tasks without overlapping the next task's scope.",
  }),
  domain: z.enum(domainEnumList).openapi({
    example: domain.WEB_DEVELOPMENT,
  }),
  subdomains: z.array(z.string()).openapi({
    example: [
      "Frontend Development",
      "Backend Development",
      "Database Management",
    ],
  }),
  tags: z.array(z.string()).openapi({
    example: [""],
  }),
  level: z.enum(levelEnumList).openapi({
    example: level.EASY,
  }),
  expected_total_minutes: z.number().min(1).openapi({
    example: 60,
  }),
});

export type TaskContextValidationType = z.infer<
  typeof taskContextValidationSchema
>;
