import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

import { userContextValidationSchema } from "./userContext.schema";
import { taskContextValidationSchema } from "./taskContextValidation.schema";

extendZodWithOpenApi(z);

export const taskGenerateValidationSchema = z
  .object({
    taskContext: taskContextValidationSchema,
    userJourneyContext: userContextValidationSchema,
  })
  .openapi("TaskGenerateContext");

export type TaskGenerateValidationType = z.infer<
  typeof taskGenerateValidationSchema
>;
