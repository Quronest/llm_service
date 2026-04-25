import { ChatPromptTemplate } from "@langchain/core/prompts";

export const userContextPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `### User Journey Context:

Current Group: {group}
Current Phase: {phase}
Current Day: {current_day}
Streak Days: {streak_days}
Total Active Days: {total_active_days}
Last Active At: {last_active_at}`,
  ],
]);