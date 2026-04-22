import { Router } from "express";
import { generateUserTasks } from "../controller/task.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.post("/generate-tasks", verifyToken, generateUserTasks);

export default router;