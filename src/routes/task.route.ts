import { Router } from "express";

import {
  generateCodingTasks,
  generateCodingTestCases,
  generateDailyPlan,
} from "../controller/task.controller";
import {
  generateReadingTasks,
  generateQuizTasks,
} from "../controller/task.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.post("/generate-daily-plan", verifyToken, generateDailyPlan);
router.post("/generate-reading-task", verifyToken, generateReadingTasks);
router.post("/generate-quiz-task", verifyToken, generateQuizTasks);
router.post("/generate-coding-task", verifyToken, generateCodingTasks);
router.post("/generate-coding-testcases", verifyToken, generateCodingTestCases);

export default router;
