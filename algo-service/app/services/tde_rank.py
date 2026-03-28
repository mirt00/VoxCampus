def compute_tde_rank(votes: int, age_hours: float, gravity: float = 1.8) -> float:
    """
    TDE-Rank (Algorithm A)
    score = (votes - 1) / (age_hours + 2) ^ gravity
    Higher score = more trending
    """
    if age_hours < 0:
        age_hours = 0
    votes_adjusted = max(votes, 0)
    return votes_adjusted / ((age_hours + 2) ** gravity)
