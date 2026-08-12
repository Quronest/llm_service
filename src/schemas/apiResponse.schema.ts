import { z } from "zod";

export const apiResponseSchema = z.object({
  statuscode: z.number().int(),
  data: z.unknown(),
  messege: z.string(),
  success: z.boolean(),
});

export type apiResponseType = z.infer<typeof apiResponseSchema>;
