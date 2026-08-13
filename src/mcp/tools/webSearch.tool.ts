import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { executeWebSearch } from "../../tools/search.tool";
import logger from "../../utils/logger";

export function registerWebSearchTool(server: McpServer) {
  server.registerTool(
    "web_search",
    {
      description:
        "Perform a web search using Tavily search engine to find up-to-date information.",
      inputSchema: z.object({
        query: z.string().describe("The search query to look up on the web"),
      }),
    },
    async ({ query }) => {
      try {
        const result = await executeWebSearch(query);
        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`Web search tool error: ${errorMessage}`);
        return {
          content: [
            {
              type: "text",
              text: `Error executing web search: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
