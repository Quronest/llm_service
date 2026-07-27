import { app } from "./app";
import { env } from "./config/env";
import { createModuleLogger } from "./utils/logger";
import "./mcp/server"

const log = createModuleLogger(import.meta.url);

const server = app.listen(env.PORT, () => {
  log.info(`Server is running at port ${env.PORT}`);
});

server.on("error", (error) => {
  log.error(`Server error: ${error.message}`);
  throw error;
});
