import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const mcpServerUrl =
  process.env.MCP_SERVER_URL || "http://localhost:3000/llm/api/v1/mcp/mcp";

export const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    systemTools: {
      url: mcpServerUrl,
      transport: "http",
    },
  },
});

