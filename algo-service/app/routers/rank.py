from fastapi import APIRouter
from app.schemas.rank_schema import RankRequest, RankResponse
from app.services.tde_rank import compute_tde_rank

router = APIRouter()

@router.post("/rank", response_model=RankResponse)
def rank(req: RankRequest):
    score = compute_tde_rank(req.votes, req.age_hours, req.gravity)
    return {"score": score}
