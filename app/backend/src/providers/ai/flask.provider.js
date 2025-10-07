import fetch from "node-fetch";

export default {
  name: "flask",
  async complete(prompt, options = {}) {
    // Parse the prompt string to extract structured data
    // Expected format: "Symptoms: ...\nAge: ...\nHistory: ..."
    let data = {};

    if (typeof prompt === 'string') {
      const lines = prompt.split('\n');
      lines.forEach(line => {
        if (line.startsWith('Symptoms:')) {
          data.symptoms = line.replace('Symptoms:', '').trim();
        } else if (line.startsWith('Age:')) {
          data.age = parseInt(line.replace('Age:', '').trim()) || 0;
        } else if (line.startsWith('History:')) {
          const history = line.replace('History:', '').trim();
          data.medical_history = history !== 'N/A' ? history : '';
        }
      });
    } else if (typeof prompt === 'object') {
      // If already an object, use it directly
      data = prompt;
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
