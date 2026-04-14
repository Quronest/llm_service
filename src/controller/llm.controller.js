
import { summarize } from "../chains/summarize.js";
import { createModuleLogger } from "../utils/logger.js";
import { getLLM } from "../llm/index.js";

const log = createModuleLogger();

export const summarizeText = async (req, res) => {
  try {
    const { text, provider } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    const llm = getLLM(provider || "gemini");

    const response = await summarize(text.trim(), llm);

    res.status(200).json({
      success: true,
      provider: provider || "gemini",
      result: response.summary,
    });

  } catch (error) {
    log.error(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};