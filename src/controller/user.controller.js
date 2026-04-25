import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateUserSummary } from "../chains/userSummary.chain.js";
import geminiLLM from "../llm/gemini.llm.js";
import { StatusCodes } from "http-status-codes";
import { createModuleLogger } from "../utils/logger.js";

const log = createModuleLogger(import.meta.url);

export const getUserSummary = asyncHandler(async (req, res) => {
  const { academic_data = {}, personal_data = {} } = req.body || {};

  // ✅ Safe validation
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
      llm
    );
    
  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      response,
      "User summary generated successfully"
    )
  );
});