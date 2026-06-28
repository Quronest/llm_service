import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { userContextValidationSchema } from "./userContext.schema";

extendZodWithOpenApi(z);

export const assistantchatContextValidationSchema = z
  .object({
    userPrompt: z.string().openapi({
      description: "The user's question or message to the assistant",
      example: "Explain recursion in simple terms.",
    }),
    chatContext: z.string().optional().openapi({
      description: "Previous conversation or background information to maintain context",
      example: "The user is studying computer science and has seen a few programming examples.",
    }),
    userContext: userContextValidationSchema
  })
  .openapi("AssistantChat");

export type AssistantChatType = z.infer<typeof assistantchatContextValidationSchema>;

export const swaggerAssistantChatSchema =
  assistantchatContextValidationSchema;