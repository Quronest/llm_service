
import { summarize } from "../chains/summarize.js";
import { createModuleLogger } from "../utils/logger.js";

const log = createModuleLogger();

export const summarizeText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "Text is required",
      });
    }

    log.info("Summarizing text...");
    const result = await summarize(text);

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    log.error("Error in summarize endpoint:", error);

    return res.status(500).json({
      error: "Failed to summarize",
      message: error.message,
    });
  }
};