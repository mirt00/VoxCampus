from app.services.tde_rank import compute_tde_rank

def test_rank_decreases_with_age():
    score_new = compute_tde_rank(votes=10, age_hours=1)
    score_old = compute_tde_rank(votes=10, age_hours=100)
    assert score_new > score_old

def test_rank_increases_with_votes():
    score_low = compute_tde_rank(votes=2, age_hours=10)
    score_high = compute_tde_rank(votes=50, age_hours=10)
    assert score_high > score_low
