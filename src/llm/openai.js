import { ChatOpenAI } from "@langchain/openai";
import { env } from "../config/env.js";

export const llm = new ChatOpenAI({
  apiKey: env.openAIApiKey,
  model: "gpt-4o-mini",
  temperature: 0,
  timeout: env.timeout,
});