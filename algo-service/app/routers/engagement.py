from fastapi import APIRouter
from app.schemas.engagement_schema import UserActivity, EngagementResponse
from app.services.engagement import compute_all

router = APIRouter()

@router.post("/engagement", response_model=EngagementResponse)
def engagement(users: list[UserActivity]):
    return compute_all([u.model_dump() for u in users])
