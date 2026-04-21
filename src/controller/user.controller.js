import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateUserSummary } from "../chains/userSummary.chain.js";
import geminiLLM from "../llm/gemini.llm.js";
import { StatusCodes } from "http-status-codes";

export const getUserSummary = asyncHandler(async (req, res) => {
  const body = req.body;

  // Separate academic and personal data from flat structure
  const academic_data = {
    institute: body.institute,
    grade: body.grade,
    course: body.course,
    courseDescription: body.courseDescription,
    interestedDomains: body.interestedDomains || [],
    skills: body.skills || [],
  };

  const personal_data = {
    primaryGoal: body.primaryGoal,
    experience: body.experience,
    personalDescription: body.personalDescription,
  };

  // Validate that required fields exist
  if (!academic_data.institute || !personal_data.primaryGoal) {
    throw new ApiError(400, "institute and primaryGoal are required fields");
  }

  const llm = geminiLLM();

  const response = await generateUserSummary({ academic_data, personal_data }, llm);

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
