from fastapi import APIRouter
from app.schemas.moderation_schema import ModerationRequest, ModerationResponse
from app.services.mlcm import run_moderation

router = APIRouter()

@router.post("/moderate", response_model=ModerationResponse)
def moderate(req: ModerationRequest):
    result = run_moderation(req.title, req.body)
    return result
