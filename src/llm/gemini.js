import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const createGeminiLLM = () => new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
});

export default createGeminiLLM;