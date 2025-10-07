import fetch from "node-fetch";

export default {
  name: "flask",
  async complete(prompt, options = {}) {
    // Parse incoming triage payload or fallback prompt string
    let data = {};

    if (typeof prompt === "string") {
      const lines = prompt.split("\n");
      lines.forEach((line) => {
        if (line.startsWith("Symptoms:")) {
          data.symptoms = line.replace("Symptoms:", "").trim();
        } else if (line.startsWith("Severity:")) {
          const value = Number(line.replace("Severity:", "").trim());
          data.severity = Number.isNaN(value) ? null : value;
        } else if (line.startsWith("Duration:")) {
          data.duration = line.replace("Duration:", "").trim();
        } else if (line.startsWith("Age:")) {
          const ageValue = Number(line.replace("Age:", "").trim());
          data.age = Number.isNaN(ageValue) ? null : ageValue;
        } else if (line.startsWith("Gender:")) {
          data.gender = line.replace("Gender:", "").trim();
        } else if (line.startsWith("Medical History:")) {
          const history = line.replace("Medical History:", "").trim();
          data.medical_history = history !== "N/A" ? history : "";
        } else if (line.startsWith("Current Medications:")) {
          const meds = line.replace("Current Medications:", "").trim();
          data.current_medications = meds !== "N/A" ? meds : "";
        }
      });
    } else if (prompt && typeof prompt === "object") {
      // If already an object, clone to avoid accidental mutation
      data = { ...prompt };
    }

    if (!data.symptoms && typeof options?.fallbackPrompt === "string") {
      return this.complete(options.fallbackPrompt);
    }

    const response = await fetch("http://flask_ai:5000/generate_summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Flask AI service failed: ${response.status}`);
    }

    return await response.text(); // string (JSON stringificado)
  },
  async chat(message, { sessionId } = {}) {
    const payload = { message };
    if (sessionId) {
      payload.session_id = sessionId;
    }

    const response = await fetch("http://flask_ai:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Flask AI chat service failed: ${response.status}`);
    }

    return await response.json();
  },
};
