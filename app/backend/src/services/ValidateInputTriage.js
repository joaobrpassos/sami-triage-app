// services/validateInput.js
export function validateInitialInput(data) {
  const errors = [];
  if (!data.age || isNaN(Number(data.age)) || 0 > Number(data.age) || Number(data.age) > 120) {
    errors.push(400)
    errors.push("Idade deve ser um número entre 0 e 120.");
  }
  if (!data.symptoms || typeof data.symptoms !== "string" || data.symptoms.trim() === "") {
    errors.push(400)
    errors.push("Sintomas devem ser informados.");
  }
  if (data.history && typeof data.history !== "string") {
    errors.push(400)
    errors.push("Histórico básico deve ser informado (mesmo que 'nenhum').");
  }

  return errors.length > 0 ? errors.join(" ") : null;
}
