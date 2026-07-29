import { TavilySearch } from "@langchain/tavily";
import logger from "../utils/logger";

export const searchTool = new TavilySearch({
  maxResults: 5,
  tavilyApiKey: process.env.TAVILY_API_KEY,
});

export async function executeWebSearch(query: string): Promise<string> {
  try {
    logger.info(`Executing web search for: "${query}"`);
    const results = await searchTool.invoke({ query });
    return typeof results === "string" ? results : JSON.stringify(results);
  } catch (error) {
    logger.warn(
      `Search failed for query "${query}": ${error}. Returning empty context.`,
    );
    return "No search results available. Generate the solution independently based on standard algorithms.";
  }
}
