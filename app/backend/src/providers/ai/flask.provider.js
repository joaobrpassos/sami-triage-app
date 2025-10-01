import fetch from "node-fetch";

export default {
	name: "flask",
	async complete(data) {
		const response = await fetch("http://localhost:5000/generate_summary", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error("Flask AI service failed");
		}

		return await response.json();
	}
};
