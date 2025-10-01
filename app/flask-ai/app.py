from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/generate_summary", methods=["POST"])
def generate_summary():
    data = request.get_json()
    #mock
    summary = {
        "subjective": f"Patient reports: {data.get('symptoms')}",
        "objective": "Temp: 38°C",
        "assessment": "Probable flu",
        "plan": "Rest and hydration"
    }
    return jsonify(summary)

if __name__ == "__main__":
    app.run(port=5000)
