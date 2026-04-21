import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const geminiLLM = () => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set in environment variables");
  }
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.7,
    apiKey,
  });
};

export default geminiLLM;