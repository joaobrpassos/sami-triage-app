import express from "express";
import cors from "cors";
import { triageHandler } from "./api/triage.controller.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/healthz", (req, res) => res.json({ status: "ok" }));
app.post("/triage", triageHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
