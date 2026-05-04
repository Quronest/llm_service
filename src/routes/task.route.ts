import { Router } from "express";

import { generateUserTasks } from "../controller/task.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.post("/generate-tasks", verifyToken, generateUserTasks);

export default router;