import type { Request, Response } from "express";
import geminiLLM from "../llm/gemini.llm";
import { asyncHandler } from "../utils/asyncHandler";
import { createModuleLogger } from "../utils/logger";
import { validateZodSchema } from "../utils/validateZodSchema";
import { assistantChatSchema } from "../schemas/assistant.schema";

const log = createModuleLogger(import.meta.url);

export const chatWithAssistantStream = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = await validateZodSchema(
      assistantChatSchema,
      req.body,
    );

    const { context, userPrompt } = validatedData;

    log.info("Received request for assistant stream chat");

    // Configure headers for Server-Sent Events (SSE) streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Prevent proxies from buffering stream

    res.flushHeaders();
    const llm = geminiLLM();

    const messages: Array<[string, string]> = [];
    if (context) {
      messages.push(["system", context]);
    }
    messages.push(["user", userPrompt]);

    try {
      const stream = await llm.stream(messages);

      for await (const chunk of stream) {
        const text = chunk.content;
        if (text) {
          const payload = JSON.stringify({ content: text });
          res.write(`data: ${payload}\n\n`);
          
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }
        }
      }

      // Signal end of stream
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error(`Error streaming from Gemini: ${errorMessage}`);

      if (!res.headersSent) {
        throw error;
      } else {
        res.write(`data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`);
        res.end();
      }
    }
  },
);
