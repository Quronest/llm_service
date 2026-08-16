export const assistantChatContextType = {
  ASK_CHAT: "ASK_CHAT",
  FILE: "FILE",
  TASK: "TASK",
} as const;

export type AssistantChatContextType =
  (typeof assistantChatContextType)[keyof typeof assistantChatContextType];

export const assistantChatContextTypeEnumList = Object.values(
  assistantChatContextType,
) as [AssistantChatContextType, ...AssistantChatContextType[]];
