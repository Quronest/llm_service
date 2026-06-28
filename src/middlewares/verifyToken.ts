import fs from "fs";

import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { createModuleLogger } from "../utils/logger";

const log = createModuleLogger(import.meta.url);

type ServiceTokenPayload = jwt.JwtPayload & {
  type?: string;
};

function getPublicKey(): string {
  try {
    const publicKeyPath = env.PUBLIC_KEY_PATH;
    if (!publicKeyPath) {
      throw new ApiError(500, "PUBLIC_KEY_PATH is not set");
    }

    const publicKey = fs.readFileSync(publicKeyPath, "utf8");

    return publicKey;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`Error reading public key: ${message}`);
    throw error;
  }
}

export const  verifyToken = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    // No token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];
    const PUBLIC_KEY = await getPublicKey();

    // Verify RSA token
    const decoded = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
    }) as ServiceTokenPayload;

    // Invalid payload type
    if (decoded.type !== "service") {
      throw new ApiError(403, "Forbidden: Invalid token type");
    }

    next();
  } catch (error) {
    log.error(error instanceof Error ? error.message : String(error));
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Token Validation Failed.",
    );
  }
};
