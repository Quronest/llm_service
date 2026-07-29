import { app } from "./app";
import { env } from "./config/env";
import { createModuleLogger } from "./utils/logger";
import { connectMcpClient } from "./mcp/client";

const log = createModuleLogger(import.meta.url);

const server = app.listen(env.PORT, () => {
  log.info(`Server is running at port ${env.PORT}`);
  connectMcpClient().catch((err) => {
    log.error(`Failed to connect to MCP client on startup: ${err}`);
  });
});

server.on("error", (error) => {
  log.error(`Server error: ${error.message}`);
  throw error;
});

