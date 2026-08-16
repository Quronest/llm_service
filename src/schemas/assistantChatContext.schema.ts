import { z } from "zod";

import { assistantChatContextTypeEnumList } from "../enums";

export const assistantChatContextValidationSchema = z.object({
  context_type: z.enum(assistantChatContextTypeEnumList),
  context_text: z.string().optional().nullable(),
  task_id: z.string().uuid().optional().nullable(),
});

export type AssistantChatContextValidationType = z.infer<
  typeof assistantChatContextValidationSchema
>;
