from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity as sk_cosine
from app.utils.text_cleaner import clean_text

def check_duplicate(new_text: str, existing_posts: list[dict], threshold: float = 0.85):
    """
    Algorithm B — Cosine Similarity duplicate detection
    Returns: { is_duplicate, score, matched_post_id }
    """
    if not existing_posts:
        return {"is_duplicate": False, "score": 0.0, "matched_post_id": None}

    cleaned_new = clean_text(new_text)
    docs = [clean_text(f"{p['title']} {p['body']}") for p in existing_posts]
    all_docs = docs + [cleaned_new]

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(all_docs)

    new_vec = tfidf_matrix[-1]
    existing_vecs = tfidf_matrix[:-1]
    scores = sk_cosine(new_vec, existing_vecs).flatten()

    max_idx = scores.argmax()
    max_score = float(scores[max_idx])

    return {
        "is_duplicate": max_score >= threshold,
        "score": max_score,
        "matched_post_id": existing_posts[max_idx]["id"] if max_score >= threshold else None,
    }
