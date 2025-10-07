// services/validateInput.js
export function validateInitialInput(data) {
  const errors = [];

  const symptoms = typeof data.symptoms === "string" ? data.symptoms.trim() : "";
  const duration = typeof data.duration === "string" ? data.duration.trim() : "";
  const ageValue = data.age === "" || data.age === undefined ? null : Number(data.age);
  const severityValue = data.severity === "" || data.severity === undefined
    ? null
    : Number(data.severity);
  const medicalHistory = data.medicalHistory ?? data.medical_history;
  const currentMedications = data.currentMedications ?? data.current_medications;
  const gender = data.gender;

  if (!symptoms) {
    errors.push(400);
    errors.push("Sintomas devem ser informados.");
  }

  if (!duration) {
    errors.push(400);
    errors.push("Duração dos sintomas deve ser informada.");
  }

  if (ageValue !== null) {
    if (Number.isNaN(ageValue) || ageValue < 0 || ageValue > 120) {
      errors.push(400);
      errors.push("Idade deve ser um número entre 0 e 120.");
    }
  }

  if (severityValue === null) {
    errors.push(400);
    errors.push("Severidade deve ser informada.");
  } else if (Number.isNaN(severityValue) || severityValue < 1 || severityValue > 10) {
    errors.push(400);
    errors.push("Severidade deve ser um número entre 1 e 10.");
  }

  if (medicalHistory && typeof medicalHistory !== "string") {
    errors.push(400);
    errors.push("Histórico médico deve ser informado em texto.");
  }

  if (currentMedications && typeof currentMedications !== "string") {
    errors.push(400);
    errors.push("Medicações atuais devem ser informadas em texto.");
  }

  if (gender && typeof gender !== "string") {
    errors.push(400);
    errors.push("Gênero deve ser informado em texto.");
  }

  return errors.length > 0 ? errors.join(" ") : null;
}
