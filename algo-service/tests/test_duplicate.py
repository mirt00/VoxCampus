from app.services.cosine_similarity import check_duplicate

EXISTING = [
    {"id": "1", "title": "Broken water pipe in block A", "body": "The pipe near block A has been leaking for days"},
    {"id": "2", "title": "Library needs more seats", "body": "The library is always full and students have no place to sit"},
]

def test_detects_duplicate_by_title():
    result = check_duplicate("Broken water pipe in block A", EXISTING, threshold=0.85)
    assert result["is_duplicate"] is True
    assert result["matched_post_id"] == "1"

def test_detects_duplicate_by_title_and_body():
    result = check_duplicate(
        "Library needs more seats",
        EXISTING,
        threshold=0.85,
        new_body="Students have no place to sit in the library",
    )
    assert result["is_duplicate"] is True
    assert result["matched_post_id"] == "2"

def test_no_duplicate_for_unrelated():
    result = check_duplicate("Canteen food quality is very poor", EXISTING, threshold=0.85)
    assert result["is_duplicate"] is False

def test_jaccard_fallback_short_text():
    # Very short text where TF-IDF may return 0 — Jaccard should handle it
    result = check_duplicate("pipe block leak", EXISTING, threshold=0.3)
    assert result["score"] > 0.0

def test_empty_new_title():
    result = check_duplicate("", EXISTING, threshold=0.85)
    assert result["is_duplicate"] is False
