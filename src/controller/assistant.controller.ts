import { response, type Request, type Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { createModuleLogger } from "../utils/logger";
import { validateZodSchema } from "../utils/validateZodSchema";
import { assistantchatContextValidationSchema } from "../schemas/assistant.schema";
import { createAssistantStream } from "../chains/assistant.chain";
import {
  generateChatSummary,
  generateChatTitle,
} from "../chains/metadata.chain";

const log = createModuleLogger(import.meta.url);

// Extend the Express Response to include the flush method added by middleware
interface SSECompressedResponse extends Response {
  flush?: () => void;
}

export const chatWithAssistantStream = asyncHandler(
  async (req: Request, res: SSECompressedResponse) => {
    const validatedData = await validateZodSchema(
      assistantchatContextValidationSchema,
      req.body,
    );

    const { userPrompt, chatContext, userContext } = validatedData;

    log.info("Received request for assistant stream chat");

    // Configure headers for Server-Sent Events (SSE) streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    res.flushHeaders();

    const userContextString = JSON.stringify(userContext);

    let fullAssistantResponse = "";

    try {
      const stream = await createAssistantStream({
        userPrompt,
        chatContext,
        userContext: userContextString,
      });

      for await (const chunk of stream) {
        const text = chunk.content;

        if (text) {
          fullAssistantResponse += text;

          const payload = JSON.stringify({ content: text });
          res.write(`data: ${payload}\n\n`);

          if (typeof res.flush === "function") {
            res.flush();
          }
        }
      }
      res.write("data: [DONE]\n\n");
      // Flush the DONE signal immediately so the client can finalize the UI
      if (typeof res.flush === "function") {
        res.flush();
      }

      try {
        const [chatTitle, chatSummary] = await Promise.all([
          generateChatTitle(userPrompt, fullAssistantResponse),
          generateChatSummary(
            chatContext ?? "",
            userPrompt,
            fullAssistantResponse,
          ),
        ]);

        log.info(`Metadata generated - Title: "${chatTitle}"`);

        const metadataPayload = JSON.stringify({
          type: "metadata",
          title: chatTitle,
          summary: chatSummary,
        });

        res.write(`data: ${metadataPayload}\n\n`);

        if (typeof res.flush === "function") {
          res.flush();
        }
      } catch (metadataError) {
        log.error(`Failed to generate title/summary: ${metadataError}`);
      }

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
