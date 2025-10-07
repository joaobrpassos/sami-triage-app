from flask import Flask, request, jsonify
import json
from pathlib import Path
from dotenv import load_dotenv
from agent import Agent

resolved_path = Path(__file__).resolve()
candidate_paths = []

# Collect .env files from current directory up to filesystem root
for parent in resolved_path.parents:
    candidate_paths.append(parent / ".env")

# Include common locations when running inside Docker containers
candidate_paths.extend([
    Path("/app/.env"),
    Path("/.env"),
])

seen = set()
for candidate in candidate_paths:
    if candidate in seen:
        continue
    seen.add(candidate)
    if candidate.exists():
        load_dotenv(candidate)
        break
else:
    load_dotenv()

app = Flask(__name__)

# Initialize agent once at startup
agent = Agent()

@app.route("/chat", methods=["POST"])
def chat_prompt():
    data = request.get_json()
    if data is None:
        return jsonify({"error": "No JSON data received"}), 400
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON format"}), 400
    message = data.get('message')
    messages = data.get('messages')
    session_id = data.get('session_id')

    if isinstance(message, str) and message.strip():
        payload = {"message": message}
    elif isinstance(messages, list) and len(messages) > 0:
        payload = messages
    else:
        return jsonify({"error": "message must be a non-empty string or messages array"}), 400
    try:
        aiResponse = agent.run_chat(payload, session_id)
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
