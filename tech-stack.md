# tech-stack.md — VoxCampus Technology Stack

## Overview

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend | React + Vite | React 18, Vite 5 | SPA UI (JSX only) |
| Styling | Tailwind CSS | v3 | Utility-first styling |
| HTTP Client | Axios | latest | API calls, cookie support |
| Data Fetching | TanStack Query | v5 | Server state, caching, refetch |
| Notifications | react-hot-toast | v2 | Success, error, duplicate toasts |
| Timestamps | date-fns | v3 | "2 hours ago" formatting |
| QR Display | qrcode.react | v3 | Render QR code SVG in admin panel |
| Backend | Node.js + Express.js | Node 20 LTS | REST API (CommonJS) |
| Database | MongoDB + Mongoose | MongoDB 7, Mongoose 8 | Data persistence + ODM |
| Auth | JWT + bcrypt | jsonwebtoken, bcryptjs | httpOnly cookie auth |
| Algorithm Service | Python + FastAPI | Python 3.11, FastAPI 0.110 | TDE-Rank, Cosine Sim, PBE |
| NLP | scikit-learn | 1.4 | TF-IDF + cosine similarity |
| Scheduler | node-cron | v3 | Hourly PBE escalation check |
| QR Generation | qrcode (npm) | v1.5 | Generate QR URL (backend) |
| Email | Nodemailer | v6 | Forgot password + escalation alerts |
| Rate Limiting | express-rate-limit | v7 | Prevent spam submissions |
| Validation | Joi | v17 | Request body validation |
| Security | Helmet | v7 | HTTP security headers |
| Environment | dotenv | v16 | Secrets management |

---

## Frontend Stack Detail

```
React + Vite (JSX — no TypeScript)
├── react-router-dom v6       — client-side routing
├── axios                     — HTTP requests (withCredentials: true for cookies)
├── @tanstack/react-query v5  — server state, caching, background refetch
├── tailwindcss v3            — styling
├── react-hot-toast           — toast notifications
├── qrcode.react              — render QR code SVG in admin panel
└── date-fns                  — human-readable timestamps ("2 hours ago")
```

---

## Backend Stack Detail

```
Node.js + Express.js (CommonJS — no TypeScript)
├── mongoose v8               — MongoDB ODM
├── jsonwebtoken              — JWT sign/verify
├── bcryptjs                  — password hashing (12 rounds)
├── cookie-parser             — read httpOnly cookies
├── express-rate-limit        — rate limiting on submit
├── cors                      — whitelist frontend origin
├── helmet                    — HTTP security headers
├── node-cron                 — scheduled escalation job (hourly)
├── nodemailer                — forgot password + escalation emails
├── axios                     — call Python FastAPI service internally
├── dotenv                    — environment variables
└── joi                       — request body validation
```

---

## Algorithm Service Stack Detail

```
Python 3.11 + FastAPI
├── fastapi                   — REST framework
├── uvicorn                   — ASGI server
├── scikit-learn              — TF-IDF + cosine_similarity
├── pymongo                   — fetch existing posts for duplicate check
└── pydantic                  — request/response models
```

---

## Dev Tools

| Tool | Purpose |
|---|---|
| Nodemon | Auto-restart backend dev server |
| Postman / Thunder Client | API testing |
| MongoDB Compass | Database GUI |
| Git + GitHub | Version control |

---

## Deployment

| Service | What |
|---|---|
| MongoDB Atlas | Free tier cloud DB |
| Render.com | Node.js backend |
| Render.com | Python FastAPI service |
| Vercel | React frontend |

---

## Environment Variables

```env
# backend/.env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
PYTHON_SERVICE_URL=http://localhost:8000
EMAIL_USER=your@email.com
EMAIL_PASS=yourpassword
CLIENT_URL=http://localhost:5173
ESCALATION_EMAIL=admin@campus.edu

# algo-service/.env
MONGO_URI=mongodb+srv://...
SIMILARITY_THRESHOLD=0.85
ESCALATION_THRESHOLD_HOURS=48
```
