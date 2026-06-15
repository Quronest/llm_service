import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const apiResponseSchema = z
  .object({
    statuscode: z.number().int().openapi({ example: 200 }),
    data: z.unknown().openapi({ description: "Response data payload" }),
    messege: z.string().openapi({ example: "Success" }),
    success: z.boolean().openapi({ example: true }),
  })
  .openapi("ApiResponse");

export type apiResponseType = z.infer<typeof apiResponseSchema>;
