import { ZodError, ZodSchema } from "zod";
import { StatusCodes } from "http-status-codes";

import { ApiError } from "./ApiError";

export const validateZodSchema = async <T>(
  schema: ZodSchema<T>,
  object: unknown,
): Promise<T> => {
  try {
    return await schema.parseAsync(object);
  } catch (err) {
    if (err instanceof ZodError) {
      const message =
        err.issues.length > 0
          ? `Validation failed: ${err.issues.map((i) => `${i.path.join(".") || "field"} - ${i.message}`).join(", ")}`
          : "Validation failed";

      throw new ApiError(StatusCodes.BAD_REQUEST, message, err.issues);
    }

    throw err;
  }
};
