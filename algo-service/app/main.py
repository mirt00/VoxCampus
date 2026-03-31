from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import rank, duplicate, escalate, moderation

load_dotenv()

app = FastAPI(title="VoxCampus Algorithm Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(rank.router)
app.include_router(duplicate.router)
app.include_router(escalate.router)
app.include_router(moderation.router)

@app.get("/health")
def health():
    return {"status": "ok"}
