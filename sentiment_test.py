from transformers import pipeline
sentiment_model = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english", device=0)
result = sentiment_model("I love programming!")
print(result)
