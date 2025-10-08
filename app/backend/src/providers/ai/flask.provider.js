import fetch from "node-fetch";

const REQUIRED_ENV_VARS = ["GEMINI_API_KEY"];
const DEFAULT_BASE_URL = "http://flask_ai:5000";

function resolveBaseUrl() {
  const baseUrl = process.env.FLASK_AI_URL || process.env.FLASK_AI_BASE_URL || DEFAULT_BASE_URL;
  if (!baseUrl) {
    const error = new Error("FLASK_AI_URL environment variable is required for Flask provider");
    error.code = "AI_PROVIDER_CONFIG_ERROR";
    throw error;
  }
  return baseUrl.replace(/\/$/, "");
}

function ensureConfigured() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key] || `${process.env[key]}`.trim() === "");
  if (missing.length > 0) {
    const error = new Error(
      `Missing required environment variables for Flask provider: ${missing.join(", ")}`
    );
    error.code = "AI_PROVIDER_CONFIG_ERROR";
    throw error;
  }

  return { baseUrl: resolveBaseUrl() };
}

export default {
  name: "flask",
  async complete(prompt, options = {}) {
    const { baseUrl } = ensureConfigured();
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

    let response;
    try {
      response = await fetch(`${baseUrl}/generate_summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (networkError) {
      const error = new Error(`Flask AI service network error: ${networkError.message}`);
      error.code = "AI_PROVIDER_NETWORK_ERROR";
      error.cause = networkError;
      throw error;
    }

    if (!response.ok) {
      const error = new Error(`Flask AI service failed: ${response.status}`);
      error.code = "AI_PROVIDER_HTTP_ERROR";
      error.status = response.status;
      throw error;
    }

    return await response.text(); // string (JSON stringificado)
  },
  async chat(message, { sessionId } = {}) {
    const { baseUrl } = ensureConfigured();
    const payload = { message };
    if (sessionId) {
      payload.session_id = sessionId;
    }

    let response;
    try {
      response = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (networkError) {
      const error = new Error(`Flask AI chat network error: ${networkError.message}`);
      error.code = "AI_PROVIDER_NETWORK_ERROR";
      error.cause = networkError;
      throw error;
    }

    if (!response.ok) {
      const error = new Error(`Flask AI chat service failed: ${response.status}`);
      error.code = "AI_PROVIDER_HTTP_ERROR";
      error.status = response.status;
      throw error;
    }

    return await response.json();
  },
};
