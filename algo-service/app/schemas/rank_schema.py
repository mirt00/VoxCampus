from pydantic import BaseModel

class RankRequest(BaseModel):
    votes: int
    age_hours: float
    gravity: float = 1.8

class RankResponse(BaseModel):
    score: float
