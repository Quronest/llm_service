import z from "zod";

import { userContextValidationSchema } from "./userContext.schema";

export const dailyPlanGenerateInputValidationSchema = z.object({
  user_context: userContextValidationSchema,
});

export type DailyPlanGenerateInputType = z.infer<
  typeof dailyPlanGenerateInputValidationSchema
>;
