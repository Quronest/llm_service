import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateUserSummary } from "../chains/userSummary.chain.js";
import geminiLLM from "../llm/gemini.llm.js";
import { StatusCodes } from "http-status-codes";

export const getUserSummary = asyncHandler(async (req, res) => {
  const body = req.body;

  // Separate academic and personal data from request
  const academic_data = {
    grade: body.grade,
    course: body.course,
    description: body.description,
    institute_name: body.institute_name,
  };
  
  const personal_data = {
    skills: body.skills || [],
    experience: body.experience,
    description: body.description,
    primary_goal: body.primary_goal,
    interested_domains: body.interested_domains || [],
  };

  // Validate that required fields exist
  if (!academic_data.institute_name || !personal_data.primary_goal) {
    throw new ApiError(400, "institute_name and primary_goal are required fields");
  }

  const llm = geminiLLM();

  const response = await generateUserSummary({ academic_data, personal_data }, llm);

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        response,
        "User summary generated successfully",
      ),
    );
});
