from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import rank, duplicate, escalate

load_dotenv()

app = FastAPI(title="VoxCampus Algorithm Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],  # only backend can call this
    allow_methods=["POST"],
    allow_headers=["*"],
)

app.include_router(rank.router)
app.include_router(duplicate.router)
app.include_router(escalate.router)

@app.get("/health")
def health():
    return {"status": "ok"}
