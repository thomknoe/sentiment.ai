# SentimentAI

SentimentAI, is an AI tool designed to analyze text data or transcribed raw dialogue from client-approved design reviews. It generates a comprehensive summary, including keyword extraction, sentiment analysis, and design categorization, allowing designers to pinpoint specific elements for refinement. Our target audience are UX/UI and product designers, particularly those that interface with various clients such as those at an agency or through freelance. The tool can also be hosted on a live web server so that users can access it from different devices.

# Quick Start

1. Clone this repository `git clone https://github.com/cakkrie/SentimentAI`
2. Download the dependencies for this project through pip `pip install flask flask-cors transformers torch torchvision keybert sentence-transformers scikit-learn`
3. Run the python Flask app `python backend.py`
4. Host the index.html on a live server, you may do this through the Go Live addon in VS Code
5. Open the app and input the text and ensure you are on a web API browser for voice recognition

# Files

- `index.html`: Primary app webpage
- `styles.css`: Styling for the HTML
- `backend.py`: Python Flask app for backend server and API calls
- `script.js`: Sends calls to backend endpoints and updates the frontend
