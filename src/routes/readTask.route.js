import { Router } from "express"
import { verifyToken } from "../middlewares/verifyToken";
import { generateUserReadTask } from "../controller/readTask.controller";

const router = Router();

router.route("/generateReadTask").post(verifyToken, generateUserReadTask);