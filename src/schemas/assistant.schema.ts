import { z } from "zod";

import { userContextValidationSchema } from "./userContext.schema";

export const assistantchatContextValidationSchema = z.object({
  userPrompt: z.string(),
  chatContext: z.string().optional(),
  userContext: userContextValidationSchema,
});

export type AssistantChatType = z.infer<
  typeof assistantchatContextValidationSchema
>;
