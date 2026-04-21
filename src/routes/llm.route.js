import { Router } from "express";
import { summarizeText } from "../controller/llm.controller.js";

const router = Router();

router.route("/summarize").post(summarizeText);

export default router;

