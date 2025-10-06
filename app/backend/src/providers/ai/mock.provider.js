// mock.provider.js
const mock = {
  name: "mock",
  async complete(data, options) {
    // Handle both direct object input and prompt string
    let symptoms = '';
    if (typeof data === 'string') {
      // Extract symptoms from prompt string if it's in the format "Symptoms: ..."
      const match = data.match(/Symptoms: (.*?)(\n|$)/);
      symptoms = match ? match[1] : '';
    } else if (data && typeof data === 'object') {
      symptoms = data.symptoms || '';
    }

    const response = {
      subjective: `Patient reports: ${symptoms}`,
      objective: "Temp: 37°C",
      assessment: "Healthy",
      plan: "No action needed",
      nextStep: symptoms && symptoms.toLowerCase().includes("chest pain")
        ? "Seek emergency care"
        : "Teleconsultation recommended",
      start_chat: false,
    };

    // Return JSON string to match expected format
    return JSON.stringify(response);
  },
};

export default mock;

