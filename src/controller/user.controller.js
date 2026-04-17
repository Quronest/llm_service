import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getGroup } from "../chains/getGroup.js";
import createGeminiLLM from "../llm/gemini.js";

export const getUserGroup = asyncHandler(async (req, res) => {
    
  const llm = createGeminiLLM();

  const response = await getGroup(req.body, llm);

  return res.status(200).json(
    new ApiResponse(
      200, 
      {
        group: response.group,
        summary: response.summary,
      }, 
      "Group and summary generated successfully"
    )
  );

});