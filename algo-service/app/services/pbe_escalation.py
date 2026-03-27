from datetime import datetime, timezone

def check_escalation(submitted_at: datetime, category_weight: float, threshold_hours: int = 48):
    """
    Algorithm C — Priority-Based Escalation (PBE)
    deadline = threshold_hours * category_weight
    Returns: { should_escalate, deadline_hours, hours_elapsed }
    """
    now = datetime.now(timezone.utc)
    if submitted_at.tzinfo is None:
        submitted_at = submitted_at.replace(tzinfo=timezone.utc)

    hours_elapsed = (now - submitted_at).total_seconds() / 3600
    deadline_hours = threshold_hours * category_weight

    return {
        "should_escalate": hours_elapsed >= deadline_hours,
        "deadline_hours": deadline_hours,
        "hours_elapsed": round(hours_elapsed, 2),
    }
