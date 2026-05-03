import geminiLLM from "../llm/gemini.llm";
import { generateReadTasks } from "../chains/readTask.chain";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const generateUserReadTask = asyncHandler(async (req, res) => {

    const { readingtContext } = req.body() || {};

    const llm = geminiLLM();

    const response = await generateReadTasks({ readingtContext }, llm);

    return res.status(200).json(
        new ApiResponse(
            200,
            response,
            "Reading task generated successfully"
        )
    )

}) 