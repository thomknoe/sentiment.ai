### Utilized assistance from OpenAIs ChatGPT to write and implement this code

from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
from keybert import KeyBERT
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import traceback

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/analyze": {"origins": "http://127.0.0.1:5500"}})

# Load models
emotion_model_name = "SamLowe/roberta-base-go_emotions"
tokenizer = AutoTokenizer.from_pretrained(emotion_model_name)
model = AutoModelForSequenceClassification.from_pretrained(emotion_model_name)
emotion_classifier = pipeline("text-classification", model=model, tokenizer=tokenizer, top_k=None)

keyword_extractor = KeyBERT()
embedder = SentenceTransformer('all-MiniLM-L6-v2')

# Predefined design-related terms
design_vocabulary = [
    "Clarity", "Simplicity", "Elegance", "Consistency", "Balance", 
    "Harmony", "Visual Appeal", "Intuitiveness", "User-Centric", "Responsiveness",
    "Legibility", "Accessibility", "Functionality", "Aesthetic Cohesion", "Usability", 
    "Flexibility", "Adaptability", "Creativity", "Innovation", "Originality", 
    "Efficiency", "Scalability", "Sustainability", "Engagement", "Interaction",
    "Visual Impact", "Precision", "Refinement", "Versatility", "Emotional Connection",
    "Timelessness", "Minimalism", "Maximalism", "Impactfulness", "Appropriateness",
    "Sustainability", "Transparency", "User-Friendliness", "Comfort", "Clarity of Purpose", 
    "Attention to Detail", "Ease of Use", "Satisfaction", "Attractiveness", "Differentiation",
    "Inspiration", "Narrative", "Functionality Over Form", "Brand Alignment", "Consistency of Tone",
    "Flow", "Structure", "Contrast", "Spacing", "Textural Sensitivity",
    "Precision in Detail", "Sustainability", "Authenticity", "Mood", "Appeal",
    "Contextual Relevance", "Innovation in Design", "Engaging Experience", "Versatility in Application", 
    "Coherence", "Craftsmanship", "Exploration", "Playfulness", "Inclusivity", 
    "Responsiveness to Change", "Provocation", "Sustainability in Materials", "Proportionality", 
    "Compositional Balance", "Tactility", "Perception", "Craft", "Resonance"
]



def extract_design_relevance(text):
    """Calculate the relevance of design-related terms in the text."""
    try:
        # Embed the input text and vocabulary terms
        text_embedding = embedder.encode([text])
        vocab_embeddings = embedder.encode(design_vocabulary)

        # Calculate cosine similarity for each term
        scores = cosine_similarity(text_embedding, vocab_embeddings)[0]
        relevancy = {design_vocabulary[i]: scores[i] for i in range(len(design_vocabulary))}

        # Sort terms by relevancy score in descending order
        sorted_relevancy = sorted(relevancy.items(), key=lambda x: x[1], reverse=True)

        return sorted_relevancy
    except Exception as e:
        print(f"Error in design relevance extraction: {e}")
        return []

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        text = data.get("text", "")

        if not text.strip():
            return jsonify({"error": "No text provided"}), 400

        # Perform emotion analysis
        emotion_scores = emotion_classifier(text)

        # Extract emotions and ensure scores are Python floats
        emotions = {entry["label"]: float(entry["score"]) for entry in emotion_scores[0]}

        # Perform keyword extraction
        keywords = keyword_extractor.extract_keywords(text, 
                                                      keyphrase_ngram_range=(1, 2), 
                                                      stop_words='english', 
                                                      top_n=10)

        # Ensure keywords are plain strings
        keywords_cleaned = [kw[0] for kw in keywords]

        # Perform design relevance analysis
        design_relevance_raw = extract_design_relevance(text)

        # Convert design relevance scores to Python floats
        design_relevance = [
            {"term": term, "relevance": float(score)} for term, score in design_relevance_raw
        ]

        return jsonify({
            "emotions": emotions,
            "keywords": keywords_cleaned,
            "design_relevance": design_relevance
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=False)
