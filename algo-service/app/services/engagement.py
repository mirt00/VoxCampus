import math

POST_WEIGHT = 3.0
VOTE_WEIGHT = 1.0

def compute_engagement_score(
    post_count: int,
    vote_count: int,
    days_since_first_activity: float,
) -> float:
    raw = (POST_WEIGHT * post_count) + (VOTE_WEIGHT * vote_count)
    if days_since_first_activity < 1:
        days_since_first_activity = 1
    time_factor = math.log(days_since_first_activity + math.e)
    return round(raw / time_factor, 2)

def compute_all(users: list[dict]) -> dict:
    scored = []
    for u in users:
        score = compute_engagement_score(u["postCount"], u["voteCount"], u["daysSinceFirstActivity"])
        scored.append({
            "userId": u["userId"],
            "name": u["name"],
            "faculty": u["faculty"],
            "postCount": u["postCount"],
            "voteCount": u["voteCount"],
            "engagementScore": score,
        })
    scored.sort(key=lambda x: x["engagementScore"], reverse=True)

    total_users = len(scored)
    avg_score = round(sum(s["engagementScore"] for s in scored) / max(total_users, 1), 2)
    total_posts = sum(s["postCount"] for s in scored)
    total_votes = sum(s["voteCount"] for s in scored)

    return {
        "users": scored,
        "summary": {
            "totalUsers": total_users,
            "averageEngagement": avg_score,
            "totalPostsCreated": total_posts,
            "totalVotesCast": total_votes,
        },
    }
