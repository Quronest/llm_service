export const chatTitlePrompt = `
You are an expert copywriter tasked with creating a concise, highly relevant title for a chat conversation.

Based on the user's prompt and the AI's response below, generate a short title (3 to 6 words maximum). 
The title should summarize the main topic or goal of the user's inquiry.

RULES:
- Respond ONLY with the title.
- Do not use quotes, punctuation at the end, or introductory text (e.g., do not say "Title:").
- Keep it professional and descriptive.

User Prompt: {userPrompt}
AI Response: {aiResponse}
`;

export const chatSummaryPrompt = `
You are an expert summarizer. Your task is to provide a brief, continuous summary of a chat conversation.

Review the optional previous chat context, the current user prompt, and the AI's response. Write a concise summary (1-3 sentences) that captures the core subject discussed and any conclusions reached.

RULES:
- Respond ONLY with the summary.
- Do not use introductory text like "Here is the summary:" or "The user asked...".
- Focus on the main takeaway of the exchange.

Previous Chat Context: 
{chatContext}

Current User Prompt: {userPrompt}
AI Response: {aiResponse}
`;
