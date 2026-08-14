import dotenv from "dotenv";

const initialNodeEnv = process.env.NODE_ENV || "development";
const envFilePath = process.env.DOTENV_CONFIG_PATH || `.env.${initialNodeEnv}`;

dotenv.config({
  path: envFilePath,
});

const parseBoolean = (value: string | undefined): boolean => value === "true";

export const env = {
  NODE_ENV: process.env.NODE_ENV || initialNodeEnv,
  PORT: process.env.PORT || 4000,
  APP_DEBUG: parseBoolean(process.env.APP_DEBUG),
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  PUBLIC_KEY_PATH: process.env.PUBLIC_KEY_PATH,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  MCP_SERVER_URL: process.env.MCP_SERVER_URL,
} as const;
