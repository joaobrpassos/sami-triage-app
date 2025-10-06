// src/controllers/chat.controller.js
import aiProvider from "../providers/ai/index.js";

export async function startChat(req, res) {
  try {
    const { body } = req;

    const prompt = `
      Você é um assistente de triagem médica.
      O paciente forneceu os seguintes dados iniciais:
      ${JSON.stringify(body)}

      Inicie uma conversa fazendo perguntas curtas e objetivas
      para coletar mais informações relevantes.
    `;

    const reply = await aiProvider.complete(prompt);

    res.json({
      chat: true,
      message: reply,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start chat" });
  }
}
