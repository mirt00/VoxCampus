# VoxCampus

Campus suggestion and complaint platform. Students submit via QR code or direct URL, vote on ideas, and admins manage and escalate issues.

## Services

| Service | Location | Port |
|---|---|---|
| Frontend (React + Vite) | `client/` | 5173 |
| Backend (Node.js + Express) | `server/` | 5000 |
| Algorithm Service (Python FastAPI) | `algo-service/` | 8000 |

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, EMAIL_*, PYTHON_SERVICE_URL
npm run dev
```

### 2. Frontend
```bash
cd client
npm install
npm run dev
```

### 3. Algorithm Service
```bash
cd algo-service
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### 4. Seed categories
```bash
cd server
node seeds/categories.seed.js
```

## Roles

| Role | Access |
|---|---|
| `user` | Submit, vote, browse |
| `admin` | Dashboard, status updates, notes |
| `superadmin` | All admin + manage admin accounts |

## Algorithms

| Algorithm | Endpoint | Purpose |
|---|---|---|
| TDE-Rank (A) | `POST /rank` | Score trending posts by votes + age |
| Cosine Similarity (B) | `POST /duplicate-check` | Detect duplicate submissions |
| PBE Escalation (C) | `POST /escalate-check` | Auto-escalate overdue posts |
