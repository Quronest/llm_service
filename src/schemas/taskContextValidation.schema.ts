import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import z from "zod";

extendZodWithOpenApi(z);

export const taskContextValidationSchema = z.object({
  title: z.string().openapi({
    example: "Frontend Development basics",
  }),
  description: z.string().openapi({
    example:
      "Currently pursuing engineering degree with focus on web development and cloud technologies.",
  }),
  domain: z.array(z.string()).openapi({
    example: ["Web Development", "Cloud Computing", "DevOps"],
  }),
  tags: z.array(z.string()).openapi({
    example: [""],
  }),
});

export type TaskContextValidationType = z.infer<
  typeof taskContextValidationSchema
>;
