import { RunnableLike } from "@langchain/core/runnables";

export type LlmWithConfig = {
  withConfig: (config: Record<string, unknown>) => RunnableLike;
};