import { createLogger, format, transports } from "winston";
import { fileURLToPath } from "url";
import path from "path";

const { combine, timestamp, printf } = format;

// Custom format
const logFormat = printf(({ level, message, timestamp, module }) => {
  return `${timestamp} | ${module || "app"} | ${level.toUpperCase()} | ${message}`;
});

// Core logger
const logger = createLogger({
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [new transports.Console()],
});

export const createModuleLogger = (metaUrl) => {
  const __filename = fileURLToPath(metaUrl);
  const moduleName = path.basename(__filename);

  const isDebug = process.env.APP_DEBUG === "true";

  return {
    info: (message) => logger.info(message, { module: moduleName }),
    error: (message) => logger.error(message, { module: moduleName }),
    warn: (message) => logger.warn(message, { module: moduleName }),
    debug: (message) => logger.debug(message, { module: moduleName }),
  };
};

export default logger;
