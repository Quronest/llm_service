import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { generateUserSummary } from "../chains/userSummary.chain";
import geminiLLM from "../llm/gemini.llm";
import { createModuleLogger } from "../utils/logger";
import { userSummaryGenerationValidationSchema } from "../schemas/userSummaryData.schema";
import { validateZodSchema } from "../utils/validateZodSchema";

const log = createModuleLogger(import.meta.url);

export const getUserSummary = asyncHandler(
  async (req: Request, res: Response) => {

    const validateData = await validateZodSchema(
      userSummaryGenerationValidationSchema,
      req.body
    );

    log.info("ready llm...");
    const llm = geminiLLM();

    log.info("generating usersummary...");
    const response = await generateUserSummary(
      validateData,
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
