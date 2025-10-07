// src/controllers/chat.controller.js
import { v4 as uuidv4 } from "uuid";
import aiProvider from "../providers/ai/index.js";

export async function chatHandler(req, res) {
  try {
    const { message, messages, session_id: sessionIdFromRequest } = req.body ?? {};

    let finalMessage = typeof message === "string" ? message : undefined;

    if (!finalMessage && Array.isArray(messages) && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (typeof lastMessage === "string") {
        finalMessage = lastMessage;
      } else if (lastMessage && typeof lastMessage === "object") {
        finalMessage = lastMessage.content ?? "";
      }
    }

    if (typeof finalMessage !== "string" || finalMessage.trim() === "") {
      return res.status(400).json({ error: "message must be a non-empty string" });
    }

    const provisionalSessionId = sessionIdFromRequest || uuidv4();
    const aiResponse = await aiProvider.chat(finalMessage, { sessionId: provisionalSessionId });

    const {
      session_id: providerSessionId,
      raw_response,
      ...summaryData
    } = aiResponse || {};

    if (raw_response !== undefined) {
      summaryData.raw_response = raw_response;
    }

    const finalSessionId = providerSessionId || provisionalSessionId;

    return res.json({
      chat: true,
      session_id: finalSessionId,
      summary: summaryData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start chat" });
  }
}
