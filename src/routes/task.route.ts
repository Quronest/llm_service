import { Router } from "express";

import { generateUserTasks } from "../controller/task.controller";
import { generateReadingTasks } from "../controller/reading-task.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

/**
 * @openapi
 * /llm/api/v1/tasks/generate-tasks:
 *   post:
 *     summary: Generate 7-day task plan
 *     description: Accepts user context to generate a 7-day task plan.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userContext
 *             properties:
 *               userContext:
 *                 $ref: '#/components/schemas/UserContext'
 *     responses:
 *       200:
 *         description: 7-day task plan generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: The generated 7-day plan details
 */
router.post("/generate-tasks", verifyToken, generateUserTasks);

/**
 * @openapi
 * /llm/api/v1/tasks/generate-reading-tasks:
 *   post:
 *     summary: Generate reading tasks
 *     description: Accepts reading context to generate a reading task with content and comprehension questions.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - readingContext
 *             properties:
 *               readingContext:
 *                 $ref: '#/components/schemas/ReadingTaskContext'
 *     responses:
 *       200:
 *         description: Reading task generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: The generated reading task details
 */
router.post("/generate-reading-tasks", verifyToken, generateReadingTasks);

export default router;
