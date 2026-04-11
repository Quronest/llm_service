import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

// Custom format
const logFormat = printf(({ level, message, timestamp, module }) => {
    return `${timestamp} | ${module || 'app'} | ${level.toUpperCase()} | ${message}`;
});

// Core logger
const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        new transports.Console(),
    ],
});

// Module-based wrapper
export const createModuleLogger = (moduleName) => {
    return {
        info: (message) => logger.info(message, { module: moduleName }),
        error: (message) => logger.error(message, { module: moduleName }),
        warn: (message) => logger.warn(message, { module: moduleName }),
        debug: (message) => logger.debug(message, { module: moduleName }),
    };
};

// Optional: export base logger too
export default logger;