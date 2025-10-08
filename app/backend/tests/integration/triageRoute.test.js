import request from "supertest";
import app from "../../src/server.js";
import { resetMetricsForTests } from "../../src/middleware/middleware.metrics.js";

describe("POST /triage", () => {
  beforeEach(() => {
    resetMetricsForTests();
  });

  it("returns summary payload when input is valid", async () => {
    const response = await request(app)
      .post("/triage")
      .send({
        symptoms: "Headache and dizziness",
        severity: 4,
        duration: "2 days",
        age: 32,
      })
      .expect(200);

    expect(response.body.chat).toBe(true);
    expect(response.body.summary).toBeDefined();
    expect(response.body.summary.subjective).toContain("Headache");
    expect(response.body.summary.nextStep).toBeDefined();
  });

  it("returns error messages when validation fails", async () => {
    const response = await request(app).post("/triage").send({}).expect(200);

    expect(response.body.summary.error).toContain("Sintomas devem ser informados");
  });
});
