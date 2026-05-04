import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { generateUserSummary } from "../chains/userSummary.chain";
import geminiLLM from "../llm/gemini.llm";
import { createModuleLogger } from "../utils/logger";

const log = createModuleLogger(import.meta.url);

export const getUserSummary = asyncHandler(
  async (req: Request, res: Response) => {
    // Extract journey_context
    const { academic_data = {}, personal_data = {} } = req.body || {};

    // Safe validation
    if (!academic_data.institute_name) {
      throw new ApiError(400, "institute_name is required");
    }

    if (!personal_data.primary_goal) {
      throw new ApiError(400, "primary_goal is required");
    }

    log.info("ready llm...");
    const llm = geminiLLM();

    log.info("generating usersummary...");
    const response = await generateUserSummary(
      { academic_data, personal_data },
      llm,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          response,
          "User summary generated successfully",
        ),
      );
  },
);
