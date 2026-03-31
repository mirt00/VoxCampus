import re

VULGAR_WORDS = [
    # English
    "damn", "crap", "idiot", "stupid", "fool", "dumb", "loser",
    "hate", "kill", "shut up", "wtf", "hell", "ass", "bastard",
    # Nepali Roman script
    "muji", "randi", "kutta", "sala", "gadhaa", "haramee",
    "bakwaas", "faltu", "bevakuf", "chutiya", "bsdk", "mck",
]

SPAM_PATTERNS = [
    (re.compile(r"(.)\1{3,}"), "repeated_characters"),
    (re.compile(r"[^aeiou\s]{6,}", re.IGNORECASE), "random_consonants"),
    (re.compile(r"^[A-Z\s]{10,}$"), "all_caps"),
    (re.compile(r"https?://|www\.", re.IGNORECASE), "url_detected"),
    (re.compile(r"\b\d{10}\b"), "phone_number"),
    (re.compile(
        r"\b(free|click here|buy now|win prize|lottery|discount|offer|limited time)\b",
        re.IGNORECASE
    ), "spam_phrase"),
]


def check_vulgar(text: str) -> tuple[bool, str]:
    lower = text.lower()
    for word in VULGAR_WORDS:
        if word in lower:
            return True, word
    return False, ""


def check_spam_patterns(text: str) -> tuple[bool, str]:
    for pattern, name in SPAM_PATTERNS:
        if pattern.search(text):
            return True, name
    return False, ""
