import { z } from "zod";

import { userContextValidationSchema } from "./userContext.schema";
import { taskContextValidationSchema } from "./taskContextValidation.schema";
import { assistantChatContextValidationSchema } from "./assistantChatContext.schema";

export const assistantchatContextValidationSchema = z.object({
  user_prompt: z.string(),
  chat_contexts: z
    .array(assistantChatContextValidationSchema)
    .optional()
    .nullable(),
  user_context: userContextValidationSchema,
  task_contexts: z
    .array(taskContextValidationSchema)
    .optional()
    .nullable(),
});

export type AssistantChatType = z.infer<
  typeof assistantchatContextValidationSchema
>;
