import { createReadingTaskChain } from "../chains/readingTask.chain";
import geminiLLM from "../llm/gemini.llm";
import { readingTaskContextValidationSchema } from "../schemas/readingTaskContext.schema";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { validateZodSchema } from "../utils/validateZodSchema";
import { Request, Response } from "express";

export const generateReadingTasks = asyncHandler(
  async (req: Request, res: Response) => {
    const { readingContext } = req.body || {};

    const validateData = await validateZodSchema(
      readingTaskContextValidationSchema,
      readingContext,
    );

    const llm = geminiLLM();

    const response = await createReadingTaskChain(
      { readingContext: validateData },
      llm,
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, response, "Reading tasks generated successfully"),
      );
  },
);
