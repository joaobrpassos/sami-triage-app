import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { triageHandler } from "./api/triage.controller.js";
import { chatHandler } from "./api/chat.controller.js";
import { logsMiddleware, errorLoggingMiddleware } from './middleware/middleware.logs.js';
import { metricsMiddleware, getMetrics } from "./middleware/middleware.metrics.js";
import { buildCorsMiddleware } from "./middleware/middleware.cors.js";
import { buildRateLimitMiddleware } from "./middleware/middleware.rate-limit.js";

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
app.use(buildCorsMiddleware());
app.use(buildRateLimitMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const frontendCandidatePaths = [
  path.resolve(moduleDir, "../../frontend/dist"),
  path.resolve(moduleDir, "../frontend/dist"),
  path.resolve(process.cwd(), "../frontend/dist"),
  path.resolve(process.cwd(), "frontend/dist"),
];

const frontendDistPath = frontendCandidatePaths.find((candidate) => fs.existsSync(candidate));

if (frontendDistPath) {
  app.use(express.static(frontendDistPath));
  app.get("/", (_req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res
      .status(200)
      .send("Frontend not built. Run the frontend build process to generate the dist folder.");
  });
}

//middlewares
app.use(logsMiddleware);
app.use(metricsMiddleware);

//routes
app.get("/healthz", (req, res) => res.json({ status: "ok" }));
app.post("/triage", triageHandler);
app.post("/chat", chatHandler);
app.get("/metrics", (_req, res) => res.json(getMetrics()));

//error middleware
app.use(errorLoggingMiddleware);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
