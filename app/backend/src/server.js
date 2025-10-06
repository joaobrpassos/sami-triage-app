import express from "express";
import cors from "cors";
import { triageHandler } from "./api/triage.controller.js";
import { chatHandler } from "./api/chat.controller.js";
import { logsMiddleware, errorLoggingMiddleware } from './middleware/middleware.logs.js';
import { metricsMiddleware, getMetrics } from "./middleware/middleware.metrics.js";

const app = express();
app.use(cors());
app.use(express.json());
//middlewares
app.use(logsMiddleware);
app.use(metricsMiddleware);

//routes
app.get("/healthz", (req, res) => res.json({ status: "ok" }));
app.post("/triage", triageHandler);
app.get("/chat", chatHandler);

//error middleware
app.use(errorLoggingMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
