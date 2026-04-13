import dotenv from "dotenv"
import { app } from "./app.js"
import { createModuleLogger } from "./utils/logger.js";

const log = createModuleLogger();

dotenv.config({
    path: "./.env.development"
})

app.on("error", (error) => {
    log.error("ERROR: ", error);
    throw error;
})
app.listen(process.env.PORT, () => {
    log.info(`Server is running at port ${process.env.PORT}`);
})
