import { describe, it, expect } from "@jest/globals";
import { validateInitialInput } from "../../src/services/ValidateInputTriage.js";

describe("validateInitialInput", () => {
  it("returns null when required fields are provided correctly", () => {
    const result = validateInitialInput({
      symptoms: "Headache and fever",
      duration: "2 days",
      age: 35,
      severity: 5,
      medicalHistory: "asthma",
      currentMedications: "ibuprofen",
      gender: "female",
    });

    expect(result).toBeNull();
  });

  it("aggregates validation messages when fields are missing or invalid", () => {
    const result = validateInitialInput({
      symptoms: " ",
      duration: "",
      age: 130,
      severity: 0,
      medicalHistory: 10,
      currentMedications: 5,
      gender: 3,
    });

    expect(result).toMatch("Sintomas devem ser informados.");
    expect(result).toMatch("Duração dos sintomas deve ser informada.");
    expect(result).toMatch("Idade deve ser um número entre 0 e 120.");
    expect(result).toMatch("Severidade deve ser um número entre 1 e 10.");
    expect(result).toMatch("Histórico médico deve ser informado em texto.");
    expect(result).toMatch("Medicações atuais devem ser informadas em texto.");
    expect(result).toMatch("Gênero deve ser informado em texto.");
  });
});
