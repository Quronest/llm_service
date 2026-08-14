import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";

import { env } from "../config/env";

const geminiLLM = () => {
  const apiKey = env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set in environment variables");
  }
  return new ChatGoogleGenerativeAI({
    model: "gemini-3.1-flash-lite-preview",
    temperature: 0.7,
    apiKey,
  });
};

export const geminiEmbeddings = (modelName: string = "gemini-embedding-001") => {
  const apiKey = env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set in environment variables");
  }
  return new GoogleGenerativeAIEmbeddings({
    apiKey,
    modelName,
  });
};

export { geminiLLM };
export default geminiLLM;


