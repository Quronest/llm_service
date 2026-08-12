import { z } from "zod";

import { userContextValidationSchema } from "./userContext.schema";
import { taskContextValidationSchema } from "./taskContextValidation.schema";
import { planContextValidationSchema } from "./planContextValidationSchema";

export const taskGenerateValidationSchema = z.object({
  task_context: taskContextValidationSchema,
  user_context: userContextValidationSchema,
  plan_context: planContextValidationSchema,
});

export type TaskGenerateValidationType = z.infer<
  typeof taskGenerateValidationSchema
>;
