import { RunnableLike } from "@langchain/core/runnables";
import z from "zod";

export type LlmWithConfig = {
  withConfig: (config: Record<string, unknown>) => RunnableLike;
  withStructuredOutput<T extends z.ZodTypeAny>(
    schema: T
  ): RunnableLike;
};
