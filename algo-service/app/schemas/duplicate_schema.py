from pydantic import BaseModel
from typing import Optional

class ExistingPost(BaseModel):
    id: str
    title: str
    body: str

class DuplicateRequest(BaseModel):
    new_title: str
    new_body: str = ""
    existing_posts: list[ExistingPost]

class DuplicateResponse(BaseModel):
    is_duplicate: bool
    score: float
    matched_post_id: Optional[str]
