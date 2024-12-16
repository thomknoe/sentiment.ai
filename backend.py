from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
from keybert import KeyBERT
from multiprocessing import freeze_support

# Initialize Flask app
app = Flask(__name__)

# Allow CORS for specific origin
CORS(app, resources={r"/analyze": {"origins": "http://127.0.0.1:5500"}})

# Load models
sentiment_model = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english", device=0)
keyword_extractor = KeyBERT()

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        text = data.get("text", "")

        if not text.strip():
            return jsonify({"error": "No text provided"}), 400

        # Perform sentiment analysis
        sentiment = sentiment_model(text)

        # Perform keyword extraction
        keywords = keyword_extractor.extract_keywords(text, 
                                                      keyphrase_ngram_range=(1, 2), 
                                                      stop_words='english', 
                                                      top_n=5)

        return jsonify({
            "sentiment": sentiment,
            "keywords": [kw[0] for kw in keywords]
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == "__main__":
    freeze_support()
    app.run(debug=False)
