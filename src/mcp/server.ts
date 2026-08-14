import crypto from "node:crypto";

import { Router } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { registerWebSearchTool } from "./tools/webSearch.tool";
import logger from "../utils/logger";

export const mcpRouter = Router();

interface McpSession {
  server: McpServer;
  transport: StreamableHTTPServerTransport;
  connected: boolean;
}

const sessions = new Map<string, McpSession>();

export function createMcpSessionInstance(sessionId?: string): McpSession {
  const server = new McpServer({
    name: "quronest-llm-service-mcp",
    version: "1.0.0",
  });

  registerWebSearchTool(server);

  let currentSessionId = sessionId;
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => {
      currentSessionId = sessionId || crypto.randomUUID();
      return currentSessionId;
    },
  });

  transport.onerror = (error: unknown) => {
    logger.error(`MCP transport error: ${error}`);
  };

  server.server.onerror = (error: Error) => {
    logger.error(`MCP server error: ${error}`);
  };

  const sessionObj: McpSession = {
    server,
    transport,
    connected: false,
  };

  if (sessionId) {
    sessions.set(sessionId, sessionObj);
  }

  return sessionObj;
}

// Default session for eager initialization
let defaultSession: McpSession | null = null;

export const initMcpServer = async (): Promise<void> => {
  if (!defaultSession) {
    defaultSession = createMcpSessionInstance();
  }
  if (!defaultSession.connected) {
    logger.info("Initializing MCP server connection to default transport...");
    await defaultSession.server.connect(defaultSession.transport);
    defaultSession.connected = true;
    if (defaultSession.transport.sessionId) {
      sessions.set(defaultSession.transport.sessionId, defaultSession);
    }
    logger.info("MCP server successfully initialized and connected");
  }
};

// Eager initialization at module load
initMcpServer().catch((error) => {
  logger.error(`Failed to initialize MCP server at module load: ${error}`);
});

mcpRouter.all("/mcp", async (req, res) => {
  logger.info(`Received MCP request: ${req.method} ${req.url}`);
  logger.debug(`MCP Request headers: ${JSON.stringify(req.headers)}`);
  logger.debug(`MCP Request body: ${JSON.stringify(req.body)}`);

  try {
    const headerSessionId = req.headers["mcp-session-id"] as string | undefined;

    let session: McpSession | undefined;
    if (headerSessionId && sessions.has(headerSessionId)) {
      session = sessions.get(headerSessionId)!;
    } else {
      session = createMcpSessionInstance(headerSessionId);
    }

    if (!session.connected) {
      await session.server.connect(session.transport);
      session.connected = true;
      if (session.transport.sessionId) {
        sessions.set(session.transport.sessionId, session);
      }
    }

    // Pass req.body as the third parameter since express.json() middleware parses it,
    // which consumes the raw request stream and makes transport.handleRequest fail if not provided.
    await session.transport.handleRequest(req, res, req.body);

    if (session.transport.sessionId && !sessions.has(session.transport.sessionId)) {
      sessions.set(session.transport.sessionId, session);
    }

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

