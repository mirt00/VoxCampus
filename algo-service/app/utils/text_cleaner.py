import re

STOP_WORDS = {"the", "a", "an", "is", "it", "in", "on", "at", "to", "for", "of", "and", "or", "but", "with", "this", "that"}

def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    words = [w for w in text.split() if w not in STOP_WORDS]
    return " ".join(words)
