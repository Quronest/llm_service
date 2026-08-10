import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import geminiLLM from "../llm/gemini.llm";
import getOpenrouterLLM from "../llm/openrouter";
import { generatePlan } from "../chains/task.chain";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { validateZodSchema } from "../utils/validateZodSchema";
import { dailyPlanGenerateInputValidationSchema } from "../schemas/dailyPlanGenerateInputValidation.schema";
import { taskGenerateValidationSchema } from "../schemas/taskGenerateValidation.schema";
import { createQuizTaskChain } from "../chains/quizTask.chain";
import { createReadingTaskChain } from "../chains/readingTask.chain";
import { createCodingProblemsChain } from "../chains/codingTask.chain";
import {
  createCodingTestCasesChain,
  generateCodingTestCasesInputSchema,
  type GenerateCodingTestCasesInputType,
} from "../chains/codingTestCases.chain";


export const generateDailyPlan = asyncHandler(
  async (req: Request, res: Response) => {
    const validateData = await validateZodSchema(
      dailyPlanGenerateInputValidationSchema,
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

export const generateCodingTasks = asyncHandler(
  async (req: Request, res: Response) => {
    const validateData = await validateZodSchema(
      taskGenerateValidationSchema,
      req.body,
    );

    const llm = geminiLLM();

    const response = await createCodingProblemsChain(
      { codingContext: validateData },
      llm,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          response,
          "Coding problems generated successfully",
        ),
      );
  },
);

export const generateCodingTestCases = asyncHandler(
  async (req: Request, res: Response) => {
    const validateData =
      await validateZodSchema<GenerateCodingTestCasesInputType>(
        generateCodingTestCasesInputSchema,
        req.body,
      );

    const llm = geminiLLM();

    const response = await createCodingTestCasesChain(
      { codingProblem: validateData },
      llm,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          response,
          "Coding test cases generated successfully",
        ),
      );
  },
);
