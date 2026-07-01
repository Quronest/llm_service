import z from "zod";
import { userContextValidationSchema } from "./userContext.schema";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const taskCreateInputValidationSchema = z.object({
  user_context: userContextValidationSchema,
});

export type TaskCreateInputType = z.infer<
  typeof taskCreateInputValidationSchema
>;

export const swaggerTaskCreateInputSchema = taskCreateInputValidationSchema;
