import { Router } from "express";

import { chatWithAssistantStream } from "../controller/assistant.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.post("/chat-stream", verifyToken, chatWithAssistantStream);

export default router;
