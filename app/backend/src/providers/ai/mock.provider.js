export default {
	name: "mock",
	async complete(data) {
		return {
			subjective: "Patient reports cough and fever",
			objective: "Temp 38°C",
			assessment: "Probable flu",
			plan: "Rest and hydration"
		};
	}
};
