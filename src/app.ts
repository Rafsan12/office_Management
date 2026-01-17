import cookieParser from "cookie-parser";
import express, { Application } from "express";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import router from "./app/router";

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.send("Hello, World! Office Management backend is running.");
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
