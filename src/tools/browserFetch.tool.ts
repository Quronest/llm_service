import { WebBrowser } from "@langchain/classic/tools/webbrowser";

import geminiLLM, { geminiEmbeddings } from "../llm/gemini.llm";
import { extractURLText } from "./extractURLText.tool";
import { executeWebSearch } from "./search.tool";
import logger from "../utils/logger";

export async function browserFetch(
  url: string,
  query: string = "",
): Promise<string> {
  const model = geminiLLM();
  const embeddings = geminiEmbeddings();

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

  try {
    const browser = new WebBrowser({
      model,
      embeddings,
      headers,
    });

    // WebBrowser expects input: "valid URL","query or empty string for summary"
    const input = `"${url}","${query.replace(/"/g, '\\"')}"`;
    const result = await browser.invoke(input);
    if (result && result.trim().length >= 50) {
      return result;
    }
  } catch (error) {
    logger.warn(`WebBrowser tool failed for ${url}: ${error}. Attempting direct fetch fallback...`);
  }

  // Fallback 1: Direct HTML fetch + cheerio extraction
  try {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
    if (response.ok) {
      const html = await response.text();
      const extracted = extractURLText(html);
      if (extracted && extracted.trim().length >= 50) {
        return extracted;
      }
    }
  } catch (directError) {
    logger.warn(`Direct fetch fallback failed for ${url}: ${directError}`);
  }

  // Fallback 2: Tavily web search for page content
  try {
    const searchFallback = await executeWebSearch(`${url} ${query}`);
    if (searchFallback && searchFallback.trim().length >= 50) {
      return searchFallback;
    }
  } catch (searchError) {
    logger.warn(`Search fallback failed for ${url}: ${searchError}`);
  }

  return `Problem from ${url}`;
}
