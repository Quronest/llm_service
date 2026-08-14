import { app } from "./app";
import { env } from "./config/env";
import { createModuleLogger } from "./utils/logger";
import { connectMcpClient } from "./mcp/client";
import { initMcpServer } from "./mcp/server";

const log = createModuleLogger(import.meta.url);

const server = app.listen(env.PORT, async () => {
  log.info(`Server is running at port ${env.PORT}`);
  try {
    await initMcpServer();
    await connectMcpClient();
  } catch (err) {
    log.error(`Failed to initialize MCP on startup: ${err}`);
  }
});

server.on("error", (error) => {
  log.error(`Server error: ${error.message}`);
  throw error;
});
