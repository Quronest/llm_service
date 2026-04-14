import openaiLLM from "./openai.js";
import geminiLLM from "./gemini.js";

export const getLLM = (provider = "gemini") => {
  switch (provider) {
    case "openai":
      return openaiLLM();
    case "gemini":
    default:
      return geminiLLM();
  }
};