import { WebBrowser } from "@langchain/classic/tools/webbrowser";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

import geminiLLM from "../llm/gemini.llm";
import { env } from "../config/env";

export async function browserFetch(
  url: string,
  query: string = "",
): Promise<string> {
  const model = geminiLLM();
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: env.GOOGLE_API_KEY,
    modelName: "gemini-embedding-001",
  });

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "cross-site",
    "Cache-Control": "max-age=0",
  };

  const browser = new WebBrowser({
    model,
    embeddings,
    headers,
  });

  // WebBrowser expects input: "valid URL","query or empty string for summary"
  const input = `"${url}","${query.replace(/"/g, '\\"')}"`;
  const result = await browser.invoke(input);
  return result;
}
