import { ChatOpenRouter } from "@langchain/openrouter";

import { env } from "../config/env";

const DEFAULT_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free"

export default function getOpenrouterLLM(model: string = DEFAULT_MODEL) {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables");
  }
  return new ChatOpenRouter(model, {
    temperature: 0.8,
    apiKey,
  });
}

