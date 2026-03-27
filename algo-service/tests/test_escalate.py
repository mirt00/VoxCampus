from datetime import datetime, timezone, timedelta
from app.services.pbe_escalation import check_escalation

def test_should_escalate_overdue():
    old_date = datetime.now(timezone.utc) - timedelta(hours=100)
    result = check_escalation(old_date, category_weight=1.0, threshold_hours=48)
    assert result["should_escalate"] is True

def test_should_not_escalate_recent():
    recent = datetime.now(timezone.utc) - timedelta(hours=5)
    result = check_escalation(recent, category_weight=1.0, threshold_hours=48)
    assert result["should_escalate"] is False
