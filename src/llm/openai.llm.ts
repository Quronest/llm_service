import { ChatOpenAI } from "@langchain/openai";

import { env } from "../config/env";

const openaiLLM = () => {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }
  return new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.7,
    apiKey,
  });
};

export default openaiLLM;
