import type { Request, Response } from "express";

import geminiLLM from "../llm/gemini.llm";
import { generatePlan } from "../chains/task.chain";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { validateZodSchema } from "../utils/validateZodSchema";
import { taskCreateInputValidationSchema } from "../schemas/taskGenerateInputValidation.schema";
import { taskGenerateValidationSchema } from "../schemas/taskGenerateValidation.schema";
import { createQuizTaskChain } from "../chains/quizTask.chain";
import { createReadingTaskChain } from "../chains/readingTask.chain";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";

export const generateDailyPlan = asyncHandler(
  async (req: Request, res: Response) => {
    const validateData = await validateZodSchema(
      taskCreateInputValidationSchema,
      req.body,
    );

    const llm = geminiLLM();

    const response = await generatePlan(validateData, llm);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          response.plan,
          "7-day task plan generated successfully",
        ),
      );
  },
);

export const generateQuizTasks = asyncHandler(
  async (req: Request, res: Response) => {
    const validateData = await validateZodSchema(
      taskGenerateValidationSchema,
      req.body,
    );

    const llm = geminiLLM();
    const response = await createQuizTaskChain(
      { quizContext: validateData },
      llm,
    );
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          response,
          "Quiz tasks generated successfully",
        ),
      );
  },
);

export const generateReadingTasks = asyncHandler(
  async (req: Request, res: Response) => {
    const validateData = await validateZodSchema(
      taskGenerateValidationSchema,
      req.body,
    );
    logger.info('Inside controller');
    const llm = geminiLLM();

    const response = await createReadingTaskChain(
      { readingContext: validateData },
      llm,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          response,
          "Reading tasks generated successfully",
        ),
      );
  },
);
