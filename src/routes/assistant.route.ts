import { Router } from "express";

import { chatWithAssistantStream } from "../controller/assistant.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

/**
 * @openapi
 * /llm/api/v1/assistant/chat-stream:
 *   post:
 *     summary: Chat with assistant and stream response
 *     description: Accepts background context and user prompt to stream the AI assistant response.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssistantChat'
 *     responses:
 *       200:
 *         description: SSE (Server-Sent Events) stream of responses
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: "data: {\"content\": \"Hello\"}\n\ndata: [DONE]\n\n"
 */
router.post("/chat-stream", verifyToken, chatWithAssistantStream);

export default router;
