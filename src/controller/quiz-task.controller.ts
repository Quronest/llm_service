import { Request, Response } from "express";
import geminiLLM from "../llm/gemini.llm";
import { taskGenerateValidationSchema } from "../schemas/taskGenerateValidation.schema";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { validateZodSchema } from "../utils/validateZodSchema";
import { createQuizTaskChain } from "../chains/quizTask.chain";

export const generateQuizTasks = asyncHandler(
  async (req: Request, res: Response) => {
    const { quizContext } = req.body || {};

    const validateData = await validateZodSchema(
      taskGenerateValidationSchema,
      quizContext,
    );

    const llm = geminiLLM();
    const response = await createQuizTaskChain({ quizContext: validateData }, llm);
    return res
      .status(200)
      .json(
        new ApiResponse(200, response, "Quiz tasks generated successfully"),
      );
  },
);
