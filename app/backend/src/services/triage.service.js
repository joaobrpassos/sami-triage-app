import aiProvider from "../providers/ai/index.js";
import { validateInitialInput } from "./ValidateInputTriage.js";

function sanitizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeTriageData(data) {
  const symptoms = sanitizeText(data.symptoms);
  const duration = sanitizeText(data.duration);
  const gender = sanitizeText(data.gender);
  const medicalHistoryRaw = data.medicalHistory ?? data.medical_history ?? "";
  const currentMedicationsRaw = data.currentMedications ?? data.current_medications ?? "";
  const medicalHistory = sanitizeText(medicalHistoryRaw);
  const currentMedications = sanitizeText(currentMedicationsRaw);

  let age = data.age;
  if (age === "" || age === undefined || age === null) {
    age = null;
  } else {
    const numericAge = Number(age);
    age = Number.isNaN(numericAge) ? null : numericAge;
  }

  let severity = data.severity;
  if (severity === "" || severity === undefined || severity === null) {
    severity = null;
  } else {
    const numericSeverity = Number(severity);
    severity = Number.isNaN(numericSeverity) ? null : numericSeverity;
  }

  const payload = {
    symptoms,
    severity,
    duration,
    age,
    gender,
    medical_history: medicalHistory,
    current_medications: currentMedications,
  };

  const frontend = {
    symptoms,
    severity,
    duration,
    age,
    gender,
    medicalHistory,
    currentMedications,
  };

  return { payload, frontend };
}

function buildPromptFromTriage(frontendData) {
  const {
    symptoms = "",
    severity,
    duration = "",
    age,
    gender = "",
    medicalHistory = "",
    currentMedications = "",
  } = frontendData;

  const ageText = age ?? "Not provided";
  const severityText = severity ?? "Not provided";
  const genderText = gender || "Not provided";
  const medicalHistoryText = medicalHistory || "N/A";
  const currentMedicationsText = currentMedications || "N/A";

  return (
    `Symptoms: ${symptoms}\n` +
    `Severity: ${severityText}\n` +
    `Duration: ${duration}\n` +
    `Age: ${ageText}\n` +
    `Gender: ${genderText}\n` +
    `Medical History: ${medicalHistoryText}\n` +
    `Current Medications: ${currentMedicationsText}`
  );
}

export async function runTriage(data) {
  const errors = validateInitialInput(data);
  if (errors) {
    return { error: errors };
  }

  const { payload, frontend } = normalizeTriageData(data);
  const prompt = buildPromptFromTriage(frontend);

  let summaryStr;
  try {
    const requestPayload = payload.symptoms ? payload : prompt;
    summaryStr = await aiProvider.complete(requestPayload);
  } catch (error) {
    throw error;
  }

  let summary;
  try {
    summary = typeof summaryStr === "string" ? JSON.parse(summaryStr) : summaryStr;
  } catch (error) {
    summary = {
      subjective: `Patient reports: ${frontend.symptoms}`,
      objective: "AI response parsing failed",
      assessment: "Unable to parse AI response",
      plan: "Retry triage or contact support",
      nextStep: "Retry",
      start_chat: false,
      parse_error: true,
    };
  }

  return {
    ...summary,
    severity: frontend.severity,
    duration: frontend.duration,
    age: frontend.age,
    gender: frontend.gender,
    medicalHistory: frontend.medicalHistory,
    currentMedications: frontend.currentMedications,
  };
}
