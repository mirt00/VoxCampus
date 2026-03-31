from pydantic import BaseModel
from typing import Optional


class ModerationRequest(BaseModel):
    title: str
    body: str


class ModerationResponse(BaseModel):
    passed: bool
    flagged: bool = False
    layer_blocked: Optional[int] = None   # 1, 2, or 3
    reason: Optional[str] = None          # "blocked_keyword" | "toxic_content" | "irrelevant" | "spam_pattern"
    toxicity_score: float = 0.0
    matched_word: Optional[str] = None
    processing_time_ms: float = 0.0
