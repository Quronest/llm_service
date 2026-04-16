import express from "express";
import cors from "cors";
import llmRouter from "./routes/llm.route.js";

const app = express();
app.use(express.json());

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use("/api/v1/llm", llmRouter)

export { app };