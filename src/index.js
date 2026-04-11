import dotenv from "dotenv"
import { app } from "./app.js"

dotenv.config({
    path: "./.env.development"
})

app.on("error", (error) => {
    console.log("ERROR: ", error);
    throw error;
})
app.listen(process.env.PORT, () => {
    console.log(`Server is running at port ${process.env.PORT}`);
})
