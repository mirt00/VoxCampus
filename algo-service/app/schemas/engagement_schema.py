from pydantic import BaseModel

class UserActivity(BaseModel):
    userId: str
    name: str
    faculty: str
    postCount: int
    voteCount: int
    daysSinceFirstActivity: float

class EngagementScore(BaseModel):
    userId: str
    name: str
    faculty: str
    postCount: int
    voteCount: int
    engagementScore: float

class EngagementResponse(BaseModel):
    users: list[EngagementScore]
    summary: dict
