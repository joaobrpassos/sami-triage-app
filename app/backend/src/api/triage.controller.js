// src/controllers/triage.controller.js
import { runTriage } from "../services/triage.service.js";
import { body, validationResult } from 'express-validator';

export async function triageHandler(req, res) {
  try {
    const result = await runTriage(req.body);

    // se IA pediu pra abrir chat
    if (result.start_chat) {
      return res.json({
        chat: true,
        message: "Chat flow started",
        partial_summary: result.partial_summary,
        chat: true,
      });
    }

    return res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to run triage" });
  }
}
