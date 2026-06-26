import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const chatContextSchema = z
  .object({
    userPrompt: z.string().openapi({
      description: "The user's question or message to the assistant",
      example: "Explain recursion in simple terms.",
    }),
    chatContext: z.string().optional().openapi({
      description: "Previous conversation or background information to maintain context",
      example: "The user is studying computer science and has seen a few programming examples.",
    }),
    userContext: z.string().openapi({
      description: "Information about the user's overall progress, current group, phase, and learning state",
      example: "User is in beginner group, phase 2, completed 5 tasks, current burnout risk: low",
    }),
  })
  .openapi("AssistantChat");

export type AssistantChatType = z.infer<typeof chatContextSchema>;
