import { Router } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";

import { registerWebSearchTool } from "./tools/webSearch.tool";
import logger from "../utils/logger";

export const mcpRouter = Router();

// Helper to create and configure a new MCP server instance per session

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "quronest-llm-service-mcp",
    version: "1.0.0",
  });

  logger.info("MCP server initialized");

  registerWebSearchTool(server);

  return server;
}

mcpRouter.all("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  const server = createMcpServer();

  await server.connect(transport);

  await transport.handleRequest(req, res);
});

const server = createMcpServer();

export default server;
