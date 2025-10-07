import aiProvider from "../providers/ai/index.js";
import { validateInitialInput } from "./ValidateInputTriage.js";

export async function runTriage(data) {
  const errors = validateInitialInput(data);
  if (errors) {
    return { error: errors };
  }

  // monta prompt de texto
  const prompt = `Symptoms: ${data.symptoms}\nAge: ${data.age}\nHistory: ${data.history || "N/A"}`;

  const summaryStr = await aiProvider.complete(prompt);
  const summary = JSON.parse(summaryStr);

  return summary;
}
