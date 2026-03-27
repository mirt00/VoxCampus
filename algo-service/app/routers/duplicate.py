from fastapi import APIRouter
from app.schemas.duplicate_schema import DuplicateRequest, DuplicateResponse
from app.services.cosine_similarity import check_duplicate
import os

router = APIRouter()

@router.post("/duplicate-check", response_model=DuplicateResponse)
def duplicate_check(req: DuplicateRequest):
    threshold = float(os.getenv("SIMILARITY_THRESHOLD", 0.85))
    existing = [{"id": p.id, "title": p.title, "body": p.body} for p in req.existing_posts]
    result = check_duplicate(req.new_text, existing, threshold)
    return result
