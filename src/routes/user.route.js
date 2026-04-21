import { Router } from "express";
import { getUserSummary } from "../controller/user.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.route("/generate-summary").post(verifyToken, getUserSummary);

export default router;
