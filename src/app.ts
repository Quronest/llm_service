import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

app.use(cors());
app.use(helmet());

app.use(express.json());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use(morgan("dev"));

import userRouter from "./routes/user.route";
import taskRouter from "./routes/task.route";

app.use("/llm/api/v1/user", userRouter);
app.use("/llm/api/v1/tasks", taskRouter);

export { app };
