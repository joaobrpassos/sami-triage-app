import { runTriage } from "../services/triage.service.js";

export async function triageHandler(req, res) {
	try {
		const result = await runTriage(req.body);
		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

