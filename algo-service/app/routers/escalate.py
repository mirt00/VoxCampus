from fastapi import APIRouter
from app.schemas.escalate_schema import EscalateRequest, EscalateResponse
from app.services.pbe_escalation import check_escalation

router = APIRouter()

@router.post("/escalate-check", response_model=EscalateResponse)
def escalate_check(req: EscalateRequest):
    result = check_escalation(req.submitted_at, req.category_weight, req.threshold_hours)
    return result
