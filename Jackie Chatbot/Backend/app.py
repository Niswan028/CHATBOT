from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_ollama import OllamaLLM  # Corrected import

app = Flask(__name__)
CORS(app)

# Initialize model with proper capitalization
model = OllamaLLM(  # Changed from ollamaLIM to OllamaLLM
    model="mistral",  # Use full model name
    base_url='http://localhost:11434',
    temperature=0.7,
    system="You are a helpful assistant"  # Add system prompt
)

conversation_history = {}

@app.route("/chat", methods=["POST"])  # Fixed methods parameter
def handle_conversation():
    try:
        data = request.json
        user_input = data.get("message", "").strip()
        session_id = data.get("session_id", "default")

        if not user_input:
            return jsonify({"error": "Empty input"}), 400

        history = conversation_history.get(session_id, "")
        prompt = f"{history}\nUser: {user_input}\nAI:"

        # Add encoding handling
        response = model.invoke(prompt).encode('utf-8', 'ignore').decode()
        
        # Update history with safe encoding
        updated_history = f"{history}\nUser: {user_input}\nAI: {response}"[-2000:]
        conversation_history[session_id] = updated_history.strip()

        return jsonify({
            "response": response.strip(),
            "session_id": session_id
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":  
    app.run(host="0.0.0.0", port=5000, debug=True)