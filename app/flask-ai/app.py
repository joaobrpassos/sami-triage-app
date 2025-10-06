from flask import Flask, request, jsonify
import json
from agent import Agent

app = Flask(__name__)

# Initialize agent once at startup
agent = Agent()

@app.route("/generate_summary", methods=["POST"])
def generate_summary():
    data = request.get_json()
    if data is None:
        return jsonify({"error": "No JSON data received"}), 400
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON format"}), 400
    
    try:
        # Run agent with the data
        aiResponse = agent.run(data)
        
        # Return as JSON string (backend expects to parse it)
        return json.dumps(aiResponse), 200, {'Content-Type': 'application/json'}
        
    except Exception as e:
        # Return error response in same format
        error_response = {
            "subjective": f"Patient reports: {data.get('symptoms', 'no symptoms reported')}",
            "objective": "Evaluation unavailable",
            "assessment": "Service error occurred",
            "plan": "Please try again",
            "nextStep": "Contact support",
            "start_chat": False,
            "error": str(e)
        }
        return json.dumps(error_response), 200, {'Content-Type': 'application/json'}

if __name__ == "__main__":
    app.run(port=5000, host="0.0.0.0")
