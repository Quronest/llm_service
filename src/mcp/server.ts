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
  logger.info(`Received MCP request: ${req.method} ${req.url}`);
  logger.debug(`MCP Request headers: ${JSON.stringify(req.headers)}`);
  logger.debug(`MCP Request body: ${JSON.stringify(req.body)}`);

  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    transport.onerror = (error: unknown) => {
      logger.error(`MCP transport error: ${error}`);
    };

    const server = createMcpServer();

    server.server.onerror = (error: Error) => {
      logger.error(`MCP server error: ${error}`);
    };

    await server.connect(transport);

    // Pass req.body as the third parameter since express.json() middleware parses it,
    // which consumes the raw request stream and makes transport.handleRequest fail if not provided.
    await transport.handleRequest(req, res, req.body);
    logger.info(`Successfully handled MCP request: ${req.method} ${req.url}`);
  } catch (error) {
    logger.error(`Failed to handle MCP request: ${error}`);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: error instanceof Error ? error.message : String(error),
        },
        id: null,
      });
    }
  }
});

