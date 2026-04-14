import { ChatOpenAI } from "@langchain/openai";

const createOpenAILLM = () => new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

export default createOpenAILLM;