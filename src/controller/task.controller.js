import geminiLLM from "../llm/gemini.llm.js";
import { generateTasks } from "../chains/task.chain.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const generateUserTasks = asyncHandler(async (req, res) => {
  const { group, phase, academic_data, personal_data } = req.body;

  if (!group || !phase) {
    throw new ApiError(400, "group and phase are required");
  }

  if (!academic_data || !personal_data) {
    throw new ApiError(400, "academic_data and personal_data are required");
  }

  const data = {
    group,
    phase,
    ...academic_data,
    ...personal_data,
  };

  const llm = geminiLLM();

  const response = await generateTasks(data, llm);

  // ✅ Success response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        llm: "gemini",
        plan: response.plan, // comes from Zod parser
      },
      "7-day task plan generated successfully"
    )
  );
});