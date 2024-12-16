from keybert import KeyBERT
kw_model = KeyBERT()
keywords = kw_model.extract_keywords("This is a sample text for testing keyword extraction.")
print(keywords)
