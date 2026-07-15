import z from "zod";
import { userContextValidationSchema } from "./userContext.schema";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const dailyPlanGenerateInputValidationSchema = z.object({
  user_context: userContextValidationSchema,
});

export type DailyPlanGenerateInputType = z.infer<
  typeof dailyPlanGenerateInputValidationSchema
>;

export const swaggerDailyPlanGenerateInputSchema =
  dailyPlanGenerateInputValidationSchema;
