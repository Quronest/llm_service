import { ChatOpenAI } from "@langchain/openai";

const openaiLLM = () => {
  const apiKey = process.env.OPENAI_API_KEY;
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