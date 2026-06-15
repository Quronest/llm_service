import { Router } from "express";

import { generateUserTasks } from "../controller/task.controller";
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

export default router;
