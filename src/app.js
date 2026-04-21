import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

import llmRouter from "./routes/llm.route.js";
import userRouter from "./routes/user.route.js";

app.use("/api/v1/llm", llmRouter);
app.use("/api/v1/user", userRouter);

export { app };
