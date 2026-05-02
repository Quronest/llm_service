import geminiLLM from "../llm/gemini.llm.js";
import { generateTasks } from "../chains/task.chain.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const generateUserTasks = asyncHandler(async (req, res) => {

  const { userContext } = req.body || {};

  const llm = geminiLLM();

  const response = await generateTasks({ userContext }, llm);

  return res.status(200).json(
    new ApiResponse(
      200,
      response.plan,
      "7-day task plan generated successfully"
    )
  );
});