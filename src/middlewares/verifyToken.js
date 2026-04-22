import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import fs from "fs";
import { createModuleLogger } from "../utils/logger.js";
import { StatusCodes } from "http-status-codes";

const log = createModuleLogger(import.meta.url);

function getPublicKey() {
  try {
    // Read the file as a string
    const publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH, "utf8");

    return publicKey;
  } catch (error) {
    log.error("Error reading public key:", error.message);
    throw error;
  }
}

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const rawHeader = authHeader.trim();

    // No token
    if (!rawHeader) {
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    const token = rawHeader.toLowerCase().startsWith("bearer ")
      ? rawHeader.slice(7).trim()
      : rawHeader;

    if (!token) {
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    const PUBLIC_KEY = await getPublicKey();

    // Verify RSA token
    const decoded = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
    });

    // Invalid payload type
    if (decoded.type !== "service") {
      throw new ApiError(403, "Forbidden: Invalid token type");
    }

    next();
  } catch (error) {
    const statusCode =
      error instanceof ApiError
        ? error.statusCode
        : StatusCodes.INTERNAL_SERVER_ERROR;

    const message =
      error instanceof ApiError
        ? error.message
        : "Token Validation Failed.";

    log.error(message);

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
