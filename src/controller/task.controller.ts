import type { Request, Response } from "express";

import geminiLLM from "../llm/gemini.llm";
import { generateTasks } from "../chains/task.chain";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { validateZodSchema } from "../utils/validateZodSchema";
import { taskCreateInputValidationSchema } from "../schemas/taskGenerateInputValidation.schema";

export const generateUserTasks = asyncHandler(
  async (req: Request, res: Response) => {
    const validateData = await validateZodSchema(
      taskCreateInputValidationSchema,
      req.body,
    );

    const llm = geminiLLM();

    const response = await generateTasks(validateData, llm);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          response.plan,
          "7-day task plan generated successfully",
        ),
      );
  },
);
