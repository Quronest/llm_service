import { summarize } from "../chains/summarize.chain.js";
import geminiLLM from "../llm/gemini.llm.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const summarizeText = asyncHandler(async (req, res) => {
  const { text } = req.body;

  // validation
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new ApiError(400, "Text is required");
  }

  // prefer Gemini by default
  const llm = geminiLLM();

  // call chain
  const response = await summarize(text.trim(), llm);

  // success response
  return res.status(200).json(
    new ApiResponse(
      200, 
      {
        llm: "gemini",
        result: response.summary,
      }, 
      "Summary generated successfully"
    )
  );
});