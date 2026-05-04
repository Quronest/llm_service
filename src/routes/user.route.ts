import { Router } from "express";

import { getUserSummary } from "../controller/user.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.route("/generate-summary").post(verifyToken, getUserSummary);

export default router;
