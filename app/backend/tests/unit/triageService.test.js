import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockComplete = jest.fn();

jest.unstable_mockModule("../../src/providers/ai/index.js", () => ({
  default: {
    name: "mock",
    complete: mockComplete,
  },
}));

const { runTriage } = await import("../../src/services/triage.service.js");

describe("runTriage", () => {
  beforeEach(() => {
    mockComplete.mockReset();
  });

  it("returns validation error messages when required fields are missing", async () => {
    const result = await runTriage({
      symptoms: "",
      duration: "",
      severity: "",
    });

    expect(result.error).toContain("Sintomas devem ser informados");
    expect(result.error).toContain("Duração dos sintomas deve ser informada");
    expect(result.error).toContain("Severidade deve ser informada");
    expect(mockComplete).not.toHaveBeenCalled();
  });

  it("normalizes payload and parses AI response JSON", async () => {
    mockComplete.mockResolvedValue(
      JSON.stringify({
        subjective: "Patient reports headache",
        objective: "Vitals stable",
        assessment: "Likely migraine",
        plan: "Provide analgesics",
        nextStep: "Teleconsultation recommended",
      })
    );

    const result = await runTriage({
      symptoms: "Headache",
      severity: "5",
      duration: "2 days",
      age: "30",
      gender: "female",
      medicalHistory: "asthma",
      currentMedications: "ibuprofen",
    });

    expect(mockComplete).toHaveBeenCalledWith({
      symptoms: "Headache",
      severity: 5,
      duration: "2 days",
      age: 30,
      gender: "female",
      medical_history: "asthma",
      current_medications: "ibuprofen",
    });
    expect(result.subjective).toBe("Patient reports headache");
    expect(result.plan).toBe("Provide analgesics");
    expect(result.nextStep).toBe("Teleconsultation recommended");
    expect(result.severity).toBe(5);
    expect(result.age).toBe(30);
    expect(result.medicalHistory).toBe("asthma");
  });

  it("returns fallback summary when AI response is not JSON", async () => {
    mockComplete.mockResolvedValue("{invalid json");

    const result = await runTriage({
      symptoms: "Chest pain",
      severity: 9,
      duration: "1 hour",
    });

    expect(result.parse_error).toBe(true);
    expect(result.subjective).toContain("Chest pain");
    expect(result.plan).toBe("Retry triage or contact support");
  });
});
