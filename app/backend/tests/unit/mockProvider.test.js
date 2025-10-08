import { describe, it, expect } from "@jest/globals";
import mockProvider from "../../src/providers/ai/mock.provider.js";

describe("mockProvider.complete", () => {
  it("serialises SOAP summary with symptoms provided as object", async () => {
    const response = await mockProvider.complete({ symptoms: "headache" });
    const parsed = JSON.parse(response);

    expect(parsed.subjective).toContain("headache");
    expect(parsed.plan).toBe("No action needed");
    expect(parsed.nextStep).toBe("Teleconsultation recommended");
  });

  it("prioritises emergency next step when symptoms mention chest pain", async () => {
    const response = await mockProvider.complete("Symptoms: sharp chest pain\n");
    const parsed = JSON.parse(response);

    expect(parsed.nextStep).toBe("Seek emergency care");
  });
});

describe("mockProvider.chat", () => {
  it("returns deterministic mock chat payload", async () => {
    const result = await mockProvider.chat("hello", { sessionId: "abc" });

    expect(result.response).toContain("hello");
    expect(result.session_id).toBe("abc");
    expect(result.ai_provider).toBe("mock");
  });
});
