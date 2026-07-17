import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

import { userContextValidationSchema } from "./userContext.schema";
import { taskContextValidationSchema } from "./taskContextValidation.schema";
import { planContextValidationSchema } from "./planContextValidationSchema";

extendZodWithOpenApi(z);

export const taskGenerateValidationSchema = z
  .object({
    task_context: taskContextValidationSchema,
    user_context: userContextValidationSchema,
    plan_context: planContextValidationSchema,
  })
  .openapi("TaskGenerateContext");

export type TaskGenerateValidationType = z.infer<
  typeof taskGenerateValidationSchema
>;
