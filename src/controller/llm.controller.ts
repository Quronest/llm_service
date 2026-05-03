import type { Request, Response } from "express";

import { summarize } from "../chains/summarize.chain";
import geminiLLM from "../llm/gemini.llm";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const summarizeText = asyncHandler(async (req: Request, res: Response) => {
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
