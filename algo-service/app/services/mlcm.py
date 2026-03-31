import time
from app.utils.blocklist import check_vulgar, check_spam_patterns

# Campus-relevant keywords for Layer 3
CAMPUS_KEYWORDS = [
    "library", "canteen", "hostel", "wifi", "internet", "water", "electricity",
    "classroom", "toilet", "bathroom", "road", "parking", "faculty", "teacher",
    "exam", "result", "fees", "transport", "bus", "sports", "playground", "lab",
    "computer", "projector", "ac", "fan", "light", "bench", "chair", "campus",
    "college", "university", "department", "notice", "gate", "security",
    "smoke", "smoking", "pass", "gate pass", "bus", "canteen", "food", "drink",
    "class", "student", "staff", "office", "building", "floor", "room",
]

# Lazy-load detoxify to avoid slow startup
_detoxify_model = None

def _get_model():
    global _detoxify_model
    if _detoxify_model is None:
        try:
            from detoxify import Detoxify
            _detoxify_model = Detoxify("original")
        except Exception:
            _detoxify_model = None
    return _detoxify_model


def run_moderation(title: str, body: str) -> dict:
    start = time.time()
    combined = f"{title} {body}".lower().strip()
    flagged = False
    toxicity_score = 0.0

    try:
        # ── LAYER 1: Keyword & Regex Filter ──────────────────────────────
        is_vulgar, matched_word = check_vulgar(combined)
        if is_vulgar:
            return {
                "passed": False, "flagged": False,
                "layer_blocked": 1, "reason": "blocked_keyword",
                "toxicity_score": 0.0, "matched_word": matched_word,
                "processing_time_ms": round((time.time() - start) * 1000, 2),
            }

        is_spam, pattern_name = check_spam_patterns(combined)
        if is_spam:
            return {
                "passed": False, "flagged": False,
                "layer_blocked": 1, "reason": "spam_pattern",
                "toxicity_score": 0.0, "matched_word": pattern_name,
                "processing_time_ms": round((time.time() - start) * 1000, 2),
            }

        # ── LAYER 2: ML Toxicity Score ────────────────────────────────────
        model = _get_model()
        if model is not None:
            try:
                results = model.predict(combined)
                toxicity_score = float(results.get("toxicity", 0.0))

                if toxicity_score > 0.75:
                    return {
                        "passed": False, "flagged": False,
                        "layer_blocked": 2, "reason": "toxic_content",
                        "toxicity_score": round(toxicity_score, 4), "matched_word": None,
                        "processing_time_ms": round((time.time() - start) * 1000, 2),
                    }

                if toxicity_score >= 0.50:
                    flagged = True  # borderline — let through but warn admin
            except Exception:
                pass  # model error — skip layer 2

        # ── LAYER 3: Campus Relevance Check ──────────────────────────────
        campus_hit = any(kw in combined for kw in CAMPUS_KEYWORDS)
        if not campus_hit and len(combined) < 40:
            return {
                "passed": False, "flagged": False,
                "layer_blocked": 3, "reason": "irrelevant",
                "toxicity_score": round(toxicity_score, 4), "matched_word": None,
                "processing_time_ms": round((time.time() - start) * 1000, 2),
            }

        # ── ALL LAYERS PASSED ─────────────────────────────────────────────
        return {
            "passed": True, "flagged": flagged,
            "layer_blocked": None, "reason": None,
            "toxicity_score": round(toxicity_score, 4), "matched_word": None,
            "processing_time_ms": round((time.time() - start) * 1000, 2),
        }

    except Exception as e:
        # Fail open — never block a real complaint due to a crash
        return {
            "passed": True, "flagged": True,
            "layer_blocked": None, "reason": f"moderation_error: {str(e)}",
            "toxicity_score": 0.0, "matched_word": None,
            "processing_time_ms": round((time.time() - start) * 1000, 2),
        }
