import aiProvider from "../providers/ai/index.js";

export async function runTriage(data) {
	const summary = await aiProvider.complete(JSON.stringify(data));
	return {
		summary,
		nextStep: suggestNextStep(data),
	};
}

function suggestNextStep({ symptoms = [] }) {
	if (symptoms.includes("chest pain")) return "Seek emergency care";
	return "Teleconsultation recommended";
}
