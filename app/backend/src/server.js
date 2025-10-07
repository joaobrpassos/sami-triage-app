import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { triageHandler } from "./api/triage.controller.js";
import { chatHandler } from "./api/chat.controller.js";
import { logsMiddleware, errorLoggingMiddleware } from './middleware/middleware.logs.js';
import { metricsMiddleware, getMetrics } from "./middleware/middleware.metrics.js";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const candidatePaths = [
  path.resolve(moduleDir, "../../../.env"),
  path.resolve(moduleDir, "../../../../.env"),
  path.resolve(moduleDir, "../.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(process.cwd(), "../../.env"),
  "/app/.env",
  "/.env",
];

let envLoaded = false;
for (const candidate of candidatePaths) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  dotenv.config();
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//middlewares
app.use(logsMiddleware);
app.use(metricsMiddleware);

//routes
app.get("/healthz", (req, res) => res.json({ status: "ok" }));
app.post("/triage", triageHandler);
app.post("/chat", chatHandler);

//error middleware
app.use(errorLoggingMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
