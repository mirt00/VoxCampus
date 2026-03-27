from app.services.cosine_similarity import check_duplicate

EXISTING = [
    {"id": "1", "title": "Broken water pipe in block A", "body": "The pipe near block A has been leaking for days"},
    {"id": "2", "title": "Library needs more seats", "body": "The library is always full and students have no place to sit"},
]

def test_detects_duplicate():
    result = check_duplicate("Water pipe leaking in block A building", EXISTING, threshold=0.3)
    assert result["is_duplicate"] is True

def test_no_duplicate_for_unrelated():
    result = check_duplicate("The canteen food quality is very poor", EXISTING, threshold=0.85)
    assert result["is_duplicate"] is False
