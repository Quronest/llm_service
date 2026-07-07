import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function readPromptFile(fileName: string): Promise<string> {
    return await readFile(join(__dirname, fileName), "utf-8");
}
export const userSummaryPrompt: string = await readPromptFile("userSummaryGeneratePrompt.md");
export const groupDetailsPrompt: string = await readPromptFile("groupDetailsPrompt.md");