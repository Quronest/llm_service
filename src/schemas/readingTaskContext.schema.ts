import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

import { userContextValidationSchema } from "./userContext.schema";

extendZodWithOpenApi(z);

export const readingTaskContextValidationSchema = z
  .object({
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
    userJourneyContext: userContextValidationSchema,
  })
  .openapi("ReadingTaskContext");

export type ReadingTaskContextValidationType = z.infer<
  typeof readingTaskContextValidationSchema
>;
