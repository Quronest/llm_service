import dotenv from "dotenv";
dotenv.config();

export const env = {
  openAIApiKey: process.env.OPENAI_API_KEY,
  timeout: Number(process.env.LLM_TIMEOUT_MS || 15000),
};