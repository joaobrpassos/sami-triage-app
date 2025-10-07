// src/controllers/triage.controller.js
import { runTriage } from "../services/triage.service.js";

export async function triageHandler(req, res) {
  try {
    const result = await runTriage(req.body);

    return res.json({
      chat: true,
      message: "Chat flow started",
      summary: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to run triage" });
  }
}
