import { TavilySearch } from "@langchain/tavily";

export const searchTool = new TavilySearch({
  maxResults: 5,
  // api is picked automatically from .env
});