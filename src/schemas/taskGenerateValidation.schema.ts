import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

import { userContextValidationSchema } from "./userContext.schema";
import { taskContextValidationSchema } from "./taskContextValidation.schema";

extendZodWithOpenApi(z);

export const taskGenerateValidationSchema = z
  .object({
    task_context: taskContextValidationSchema,
    user_context: userContextValidationSchema,
  })
  .openapi("TaskGenerateContext");

export type TaskGenerateValidationType = z.infer<
  typeof taskGenerateValidationSchema
>;
