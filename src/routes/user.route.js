import { Router } from "express";
import { getUserGroup } from "../controller/user.controller.js";

const router = Router();

router.route("/get-Group").post(getUserGroup);

export default router;