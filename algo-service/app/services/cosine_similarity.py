from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity as sk_cosine
from app.utils.text_cleaner import clean_text


def _jaccard(text_a: str, text_b: str) -> float:
    """Jaccard similarity on word sets."""
    set_a = set(text_a.split())
    set_b = set(text_b.split())
    if not set_a and not set_b:
        return 0.0
    return len(set_a & set_b) / len(set_a | set_b)


def _cosine(text_a: str, text_b: str) -> float:
    """TF-IDF cosine similarity. Falls back to Jaccard if TF-IDF cannot vectorize."""
    if not text_a.strip() or not text_b.strip():
        return 0.0
    try:
        vectorizer = TfidfVectorizer()
        matrix = vectorizer.fit_transform([text_a, text_b])
        score = float(sk_cosine(matrix[0], matrix[1])[0][0])
        # If TF-IDF yields 0 (e.g. no shared vocabulary after cleaning), use Jaccard
        if score == 0.0:
            return _jaccard(text_a, text_b)
        return score
    except Exception:
        # TF-IDF failed entirely (e.g. empty vocab) — fall back to Jaccard
        return _jaccard(text_a, text_b)


def check_duplicate(new_title: str, existing_posts: list[dict], threshold: float = 0.85, new_body: str = ""):
    """
    Algorithm B — Cosine Similarity duplicate detection with Jaccard fallback.

    Compares title-to-title and body-to-body separately.
    A post is flagged as duplicate if:
      - title similarity >= threshold, OR
      - title similarity >= 0.5 AND body similarity >= 0.5

    Falls back to Jaccard similarity when TF-IDF cosine returns 0
    (e.g. very short text, no shared vocabulary after cleaning).

    Returns: { is_duplicate, score, matched_post_id }
    """
    if not existing_posts:
        return {"is_duplicate": False, "score": 0.0, "matched_post_id": None}

    clean_new_title = clean_text(new_title)
    clean_new_body = clean_text(new_body) if new_body else clean_new_title

    best_score = 0.0
    best_id = None

    for post in existing_posts:
        existing_title = clean_text(post.get("title", ""))
        existing_body = clean_text(post.get("body", ""))

        title_sim = _cosine(clean_new_title, existing_title)
        body_sim = _cosine(clean_new_body, existing_body)

        # Combined score: weighted toward title (title is more discriminative)
        combined = max(title_sim, (title_sim * 0.6 + body_sim * 0.4))

        if combined > best_score:
            best_score = combined
            best_id = post["id"]

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
