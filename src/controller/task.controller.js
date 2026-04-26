import geminiLLM from "../llm/gemini.llm.js";
import { generateTasks } from "../chains/task.chain.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const generateUserTasks = asyncHandler(async (req, res) => {
  // Extract journey_context alongside the others
  const { group, phase, academic_data, personal_data, journey_context = {} } = req.body || {};

  if (!group || !phase) {
    throw new ApiError(400, "group and phase are required");
  }

  if (!academic_data || !personal_data) {
    throw new ApiError(400, "academic_data and personal_data are required");
  }

  const llm = geminiLLM();

  // Pass the nested objects directly so the chain can destructure cleanly
  const response = await generateTasks({
    group,
    phase,
    academic_data,
    personal_data,
    journey_context
  }, llm);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        llm: "gemini",
        plan: response.plan, 
      },
      "7-day task plan generated successfully"
    )
  );
});