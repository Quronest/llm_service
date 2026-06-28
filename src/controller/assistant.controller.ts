import { response, type Request, type Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { createModuleLogger } from "../utils/logger";
import { validateZodSchema } from "../utils/validateZodSchema";
import { chatContextSchema } from "../schemas/assistant.schema";
import { createAssistantStream } from "../chains/assistant.chain"; 

const log = createModuleLogger(import.meta.url);

// Extend the Express Response to include the flush method added by middleware
interface SSECompressedResponse extends Response {
  flush?: () => void;
}

export const chatWithAssistantStream = asyncHandler(
  async (req: Request, res: SSECompressedResponse) => {
    const validatedData = await validateZodSchema(chatContextSchema, req.body);

    const { userPrompt, chatContext, userContext } = validatedData;

    log.info("Received request for assistant stream chat");

    // Configure headers for Server-Sent Events (SSE) streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    res.flushHeaders();

    const userContextString = JSON.stringify(userContext);

    try {
      const stream = await createAssistantStream({
        userPrompt,
        chatContext,
        userContext: userContextString
      });

      for await (const chunk of stream) {
        const text = chunk.content;

        if (text) {
          const payload = JSON.stringify({ content: text });
          res.write(`data: ${payload}\n\n`);

          if (typeof res.flush === "function") {
            res.flush();
          }
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      log.error(`Error streaming from Gemini: ${errorMessage}`);

      if (!res.headersSent) {
        throw error;
      } else {
        res.write(
          `data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`,
        );
        res.end();
      }
    }
  },
);
