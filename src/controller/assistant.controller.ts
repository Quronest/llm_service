import type { Request, Response } from "express";

import { createAssistantStream } from "../chains/assistant.chain";
import {
  generateChatSummary,
  generateChatTitle,
} from "../chains/metadata.chain";
import { StreamFlag } from "../enums/streamFlag.enum";
import { assistantchatContextValidationSchema } from "../schemas/assistant.schema";
import { asyncHandler } from "../utils/asyncHandler";
import { createModuleLogger } from "../utils/logger";
import { validateZodSchema } from "../utils/validateZodSchema";

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

    const { user_prompt, chat_contexts, user_context, task_contexts } =
      validatedData;

    log.info("Received request for assistant stream chat");

    // Configure headers for Server-Sent Events (SSE) streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    res.flushHeaders();

    const userContextString = JSON.stringify(user_context);
    const taskContextsString =
      task_contexts && task_contexts.length > 0
        ? JSON.stringify(task_contexts, null, 2)
        : "";
    const chatContextsString =
      chat_contexts && chat_contexts.length > 0
        ? JSON.stringify(chat_contexts, null, 2)
        : "";
    let fullAssistantResponse = "";

    try {
      // Send START event
      const startPayload = JSON.stringify({
        flag: StreamFlag.START,
        data: { timestamp: new Date().toISOString() },
      });
      res.write(`data: ${startPayload}\n\n`);
      if (typeof res.flush === "function") {
        res.flush();
      }

      const stream = await createAssistantStream({
        userPrompt: user_prompt,
        chatContexts: chatContextsString,
        userContext: userContextString,
        taskContexts: taskContextsString,
      });

      for await (const chunk of stream) {
        const text =
          typeof chunk.content === "string"
            ? chunk.content
            : String(chunk.content ?? "");

        if (text) {
          fullAssistantResponse += text;

          const payload = JSON.stringify({
            flag: StreamFlag.CHUNK,
            data: { content: text },
          });
          res.write(`data: ${payload}\n\n`);

          if (typeof res.flush === "function") {
            res.flush();
          }
        }
      }

      try {
        const [chatTitle, chatSummary] = await Promise.all([
          generateChatTitle(user_prompt, fullAssistantResponse),
          generateChatSummary(
            chatContextsString,
            user_prompt,
            fullAssistantResponse,
          ),
        ]);

        log.info(`Metadata generated - Title: "${chatTitle}"`);

        const metadataPayload = JSON.stringify({
          flag: StreamFlag.METADATA,
          data: {
            title: chatTitle,
            summary: chatSummary,
          },
        });

        res.write(`data: ${metadataPayload}\n\n`);

        if (typeof res.flush === "function") {
          res.flush();
        }
      } catch (metadataError) {
        log.error(`Failed to generate title/summary: ${metadataError}`);
      }

      // Send DONE event
      const donePayload = JSON.stringify({
        flag: StreamFlag.DONE,
        data: null,
      });
      res.write(`data: ${donePayload}\n\n`);
      if (typeof res.flush === "function") {
        res.flush();
      }

      res.end();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      log.error(`Error streaming: ${errorMessage}`);

      if (!res.headersSent) {
        throw error;
      } else {
        const errorPayload = JSON.stringify({
          flag: StreamFlag.ERROR,
          data: { error: "Stream error occurred" },
        });
        res.write(`data: ${errorPayload}\n\n`);
        res.end();
      }
    }
  },
);
