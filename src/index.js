import dotenv from "dotenv";
import { app } from "./app.js";
import { createModuleLogger } from "./utils/logger.js";

dotenv.config({
  path: "./.env.development",
});

const log = createModuleLogger(import.meta.url);

const port = Number(process.env.PORT);

const server = app.listen(port, () => {
  log.info(`Server is running at port ${port}`);
});

server.on("error", (error) => {
  log.error(`Server error: ${error.message}`);
  throw error;
});
