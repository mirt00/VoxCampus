# tech-stack.md — VoxCampus Technology Stack

## Overview

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend | React + Vite | React 18, Vite 5 | SPA UI (JSX only) |
| Styling | Tailwind CSS | v3 | Utility-first styling |
| Form Validation | React Hook Form | v7 | Form state + validation |
| HTTP Client | Axios | latest | API calls, cookie support |
| Data Fetching | TanStack Query | v5 | Server state, caching, refetch |
| Notifications | react-hot-toast | v2 | Success, error, duplicate toasts |
| Timestamps | date-fns | v3 | "2 hours ago" formatting |
| QR Display | qrcode.react | v3 | Render QR code SVG in admin panel |
| Backend | Node.js + Express.js | Node 20 LTS | REST API (CommonJS) |
| Database | MongoDB + Mongoose | MongoDB 7, Mongoose 8 | Data persistence + ODM |
| Auth | JWT + bcrypt | jsonwebtoken, bcryptjs | httpOnly cookie auth |
| Algorithm Service | Python + FastAPI | Python 3.11, FastAPI 0.110 | TDE-Rank, Cosine Sim, PBE, MLCM |
| NLP | scikit-learn | 1.4+ | TF-IDF + cosine similarity |
| Content Moderation | detoxify | 0.5+ | ML toxicity scoring (Layer 2) |
| Scheduler | node-cron | v3 | Hourly PBE escalation check |
| QR Generation | qrcode (npm) | v1.5 | Generate QR codes for submission URL |
| Email | Nodemailer | v6 | Forgot password + escalation alerts |
| Rate Limiting | express-rate-limit | v7 | Prevent spam submissions |
| Validation | Joi | v17 | Request body validation |
| Security | Helmet | v7 | HTTP security headers |
| Image Upload | Cloudinary + Multer | — | Profile and post image storage |
| Environment | dotenv | v16 | Secrets management |

---

## Frontend Stack Detail

```
React + Vite (JSX — no TypeScript)
├── react-router-dom v6       — client-side routing
├── axios                     — HTTP requests (withCredentials: true for cookies)
├── @tanstack/react-query v5  — server state, caching, background refetch
├── react-hook-form v7        — form validation (Register, Login, SubmitPost)
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
├── node-cron                 — scheduled escalation job (hourly) + keep-alive ping
├── nodemailer                — forgot password + escalation emails
├── axios                     — call Python FastAPI service internally
├── multer                    — multipart file upload handling
├── cloudinary                — image storage (avatars + post attachments)
├── dotenv                    — environment variables
└── joi                       — request body validation
```

---

## Algorithm Service Stack Detail

```
Python 3.11 + FastAPI
├── fastapi                   — REST framework
├── uvicorn                   — ASGI server
├── scikit-learn              — TF-IDF + cosine_similarity (Algorithm B)
├── detoxify                  — ML toxicity scoring (Algorithm D Layer 2)
├── pymongo                   — fetch existing posts for duplicate check
└── pydantic                  — request/response models
```

---

## Algorithms

| Algorithm | Name | Endpoint | Purpose |
|---|---|---|---|
| A | TDE-Rank | `POST /rank` | Score trending posts by votes + age |
| B | Cosine Similarity | `POST /duplicate-check` | Detect duplicate submissions |
| C | PBE Escalation | `POST /escalate-check` | Auto-escalate overdue posts |
| D | MLCM | `POST /moderate` | 3-layer content moderation |

### Algorithm D — MLCM Layers
- Layer 1: Keyword blocklist + spam regex (runs locally in Node.js, always active)
- Layer 2: ML toxicity score via detoxify (runs in Python, optional)
- Layer 3: Campus relevance check (runs locally in Node.js, always active)

---

## Routes Summary

### Public (require login)
- `GET /feed` — main feed
- `GET /submit` — post suggestion
- `GET /post/:id` — post detail
- `GET /profile` — user profile
- `GET /change-password` — change password

### Auth (redirect to /feed if logged in)
- `GET /` — login page (root)
- `GET /login` — login
- `GET /register` — register (fields: name, email, password, faculty, phone)
- `GET /forgot-password` — forgot password
- `GET /reset-password/:token` — reset password

### Admin (protected)
- `GET /admin/login` — admin login
- `GET /admin/dashboard` — post management
- `GET /admin/reports` — analytics report
- `GET /admin/qr` — QR code page
- `GET /admin/manage-admins` — superadmin only

---

## Faculty Options
BCA, CSIT, BBM, BBA, BBS, +2, B.Ed

---

## Deployment

| Service | Platform |
|---|---|
| Frontend + Backend (unified) | Render (Node web service) |
| Algorithm Service | Render (Python web service) |
| Database | MongoDB Atlas |
| Image Storage | Cloudinary |
