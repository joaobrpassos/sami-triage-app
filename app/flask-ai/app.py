from flask import Flask, request, jsonify
from werkzeug.datastructures.structures import exceptions
from agent import Agent

app = Flask(__name__)

@app.route("/generate_summary", methods=["POST"])
def generate_summary():
    data = request.get_json()
    if data is None:
        return jsonify({"error": "No JSON data received"}), 400
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON format"}), 400
    try:
        agentai = Agent()
        aiResponse = agentai.run(data)
        
    #mock
    except exceptions as e:
        summary = {
            "mock": True,
            "errors" : e,
            "subjective": f"Patient reports: {data.get('symptoms', 'no symptons reported')}",
            "objective": "Temp: 38°C",
            "assessment": "Probable flu",
            "plan": "Rest and hydration"
        }
        return jsonify(summary)

if __name__ == "__main__":
    app.run(port=5000, host="0.0.0.0")
