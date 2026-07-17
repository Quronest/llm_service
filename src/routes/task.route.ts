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

/**
 * @openapi
 * /llm/api/v1/tasks/generate-daily-plan:
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
 *               $ref: '#/components/schemas/TaskCreateContxt'
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
router.post("/generate-daily-plan", verifyToken, generateDailyPlan);

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
 *             $ref: '#/components/schemas/TaskGenerateContext'
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
router.post("/generate-reading-task", verifyToken, generateReadingTasks);

/**
 * @openapi
 * /llm/api/v1/tasks/generate-quiz-task:
 *   post:
 *     summary: Generate quiz tasks
 *     description: Accepts quiz context to generate a quiz task with content and comprehension questions.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskGenerateContext'
 *     responses:
 *       200:
 *         description: Quiz task generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: The generated quiz task details
 */
router.post("/generate-quiz-task", verifyToken, generateQuizTasks);

/**
 * @openapi
 * /llm/api/v1/tasks/generate-coding-task:
 *   post:
 *     summary: Generate coding tasks
 *     description: Accepts task context, user context, and plan context to generate coding problems with titles, constraints, examples, and function signatures.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskGenerateContext'
 *     responses:
 *       200:
 *         description: Coding problems generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CodingProblemsResponse'
 */
router.post("/generate-coding-task", verifyToken, generateCodingTasks);

/**
 * @openapi
 * /llm/api/v1/tasks/generate-coding-testcases:
 *   post:
 *     summary: Generate coding test cases
 *     description: Accepts generated coding problems and returns public and hidden test cases for each one.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CodingTestCasesInput'
 *           example:
 *             - title: "Maximum Pair Sum"
 *               difficulty: "Easy"
 *               description: "Given an array of integers, return the maximum pair sum."
 *               constraints:
 *                 - "1 <= n <= 1e5"
 *               time_limit: 2
 *               memory_limit: 256
 *               functionSignature:
 *                 language: "cpp"
 *                 functionName: "solve"
 *               examples:
 *                 - input: "4\n1 2 3 4"
 *                   output: "7"
 *     responses:
 *       200:
 *         description: Coding test cases generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: The generated coding test case bundles
 */
router.post("/generate-coding-testcases", verifyToken, generateCodingTestCases);

export default router;
