import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function readPromptFile(fileName: string): Promise<string> {
  return await readFile(join(__dirname, fileName), "utf-8");
}

export const userSummaryPrompt: string = await readPromptFile(
  "userSummaryGeneratePrompt.md",
);

export const groupDetailsPrompt: string = await readPromptFile(
  "groupDetailsPrompt.md",
);

export const generateDailyTaskPrompt: string = await readPromptFile(
  "generateDailyTaskPrompt.md",
);

export const userContextPrompt: string = await readPromptFile(
  "userContextPrompt.md",
);

export const generateReadingTasksPrompt: string = await readPromptFile(
  "generateReadingTasksPrompt.md",
);

export const findUrlsPrompt: string = await readPromptFile("findUrlsPrompt.md");

export const generateQuizTasksPrompt: string = await readPromptFile(
  "generateQuizTasksPrompt.md",
);

export const createQuizPlanPrompt: string = await readPromptFile(
  "createQuizPlanPrompt.md",
);

export const assistantPrompt: string = await readPromptFile(
  "assistantPrompt.md",
);

export const chatTitlePrompt: string = await readPromptFile(
  "chatTitlePrompt.md",
);

export const chatSummaryPrompt: string = await readPromptFile(
  "chatSummaryPrompt.md",
);

