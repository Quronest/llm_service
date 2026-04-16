import { ChatPromptTemplate } from "@langchain/core/prompts";

export const summarizePrompt = ChatPromptTemplate.fromTemplate(`
Summarize the following text.

Return ONLY valid JSON in this format:
{{
  "summary": "your summary here"
}}

Text:
{text}
`);