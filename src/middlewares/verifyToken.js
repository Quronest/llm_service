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
    const authHeader = req.headers.authorization;

    // No token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];
    log.debug("token - " + token);
    const PUBLIC_KEY = await getPublicKey();
    log.debug("Key - " + PUBLIC_KEY);

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
    log.error(error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Token Validation Failed.",
    );
  }
};
