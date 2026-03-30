from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity as sk_cosine
from app.utils.text_cleaner import clean_text

def _similarity(text_a: str, text_b: str) -> float:
    """Compute cosine similarity between two texts."""
    if not text_a.strip() or not text_b.strip():
        return 0.0
    vectorizer = TfidfVectorizer()
    try:
        matrix = vectorizer.fit_transform([text_a, text_b])
        return float(sk_cosine(matrix[0], matrix[1])[0][0])
    except Exception:
        return 0.0

def check_duplicate(new_text: str, existing_posts: list[dict], threshold: float = 0.85):
    """
    Algorithm B — Cosine Similarity duplicate detection.
    Compares title-to-title AND body-to-body separately.
    A post is duplicate if:
      - title similarity >= threshold, OR
      - title similarity >= 0.5 AND body similarity >= 0.5
    Returns: { is_duplicate, score, matched_post_id }
    """
    if not existing_posts:
        return {"is_duplicate": False, "score": 0.0, "matched_post_id": None}

    # Split new_text into title and body (first line = title, rest = body)
    parts = new_text.strip().split(" ", 6)
    new_title = clean_text(new_text[:50])   # approximate title portion
    new_body = clean_text(new_text)          # full text as body fallback

    best_score = 0.0
    best_id = None

    for post in existing_posts:
        existing_title = clean_text(post.get("title", ""))
        existing_body = clean_text(post.get("body", ""))
        existing_full = clean_text(f"{post.get('title', '')} {post.get('body', '')}")

        title_sim = _similarity(new_title, existing_title)
        body_sim = _similarity(new_body, existing_body)
        full_sim = _similarity(new_body, existing_full)

        # Use the highest signal
        combined = max(title_sim, full_sim, (title_sim + body_sim) / 2)

        if combined > best_score:
            best_score = combined
            best_id = post["id"]

        # Block if title is very similar OR both title+body are moderately similar
        if title_sim >= threshold or (title_sim >= 0.5 and body_sim >= 0.5):
            return {
                "is_duplicate": True,
                "score": round(combined, 4),
                "matched_post_id": post["id"],
            }

    return {
        "is_duplicate": best_score >= threshold,
        "score": round(best_score, 4),
        "matched_post_id": best_id if best_score >= threshold else None,
    }
