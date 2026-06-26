import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const assistantChatSchema = z
  .object({
    context: z.string().optional().openapi({
      description: "The context or background information for the chatbot",
      example: "The user is studying computer science.",
    }),
    userPrompt: z.string().openapi({
      description: "The prompt/message from the user",
      example: "Explain recursion in simple terms.",
    }),
  })
  .openapi("AssistantChat");

export type AssistantChatType = z.infer<typeof assistantChatSchema>;
