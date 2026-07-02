import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { domainEnumList } from "../enums/domain.enum";
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
  domain: z.enum(domainEnumList).openapi({
    example: "Web Development",
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
    example: level.EASY
  })
});

export type TaskContextValidationType = z.infer<
  typeof taskContextValidationSchema
>;
