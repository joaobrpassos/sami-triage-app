import fetch from "node-fetch";

export default {
  name: "flask",
  async complete(prompt, options = {}) {
    const response = await fetch("http://flask_ai:5000/generate_summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Flask AI service failed: ${response.status}`);
    }

    return await response.text(); // string (JSON stringificado)
  },
};
;
