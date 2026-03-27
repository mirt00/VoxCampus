from pydantic import BaseModel
from datetime import datetime

class EscalateRequest(BaseModel):
    submitted_at: datetime
    category_weight: float
    threshold_hours: int = 48

class EscalateResponse(BaseModel):
    should_escalate: bool
    deadline_hours: float
    hours_elapsed: float
