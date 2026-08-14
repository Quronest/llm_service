import { MultiServerMCPClient } from "@langchain/mcp-adapters";

import logger from "../utils/logger";
import { env } from "../config/env";

const mcpServerUrl =
  env.MCP_SERVER_URL ||
  process.env.MCP_SERVER_URL ||
  `http://localhost:${env.PORT || 4000}/llm/api/v1/mcp/mcp`;

export const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    systemTools: {
      url: mcpServerUrl,
      transport: "http",
    },
  },
});

export const connectMcpClient = async (): Promise<void> => {
  const retryCount = 10;
  const sleepMs = 3000;

  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      logger.info(
        `Connecting to MCP client (attempt ${attempt}/${retryCount})...`,
      );
      await mcpClient.initializeConnections();
      logger.info("Successfully connected to MCP client");
      return;
    } catch (error) {
      logger.error(
        `Failed to connect to MCP client on attempt ${attempt}/${retryCount}: ${error}`,
      );
      if (attempt < retryCount) {
        logger.info(`Sleeping for ${sleepMs / 1000}s before next retry...`);
        await new Promise((resolve) => setTimeout(resolve, sleepMs));
      } else {
        throw error;
      }
    }
  }
};
