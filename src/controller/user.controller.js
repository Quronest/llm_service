import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateUserSummary } from "../chains/userSummary.chain.js";
import geminiLLM from "../llm/gemini.llm.js";
import { StatusCodes } from "http-status-codes";

export const getUserSummary = asyncHandler(async (req, res) => {
  const llm = geminiLLM();

  const response = await generateUserSummary(req.body, llm);

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        response,
        "Group and summary generated successfully",
      ),
    );
});
