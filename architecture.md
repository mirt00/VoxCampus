# architecture.md — VoxCampus

## System Overview

Campus suggestion platform. Students submit suggestions via QR or URL, vote on ideas, admins manage and escalate issues. All content is moderated by 4 algorithms before saving.

---

## High-Level Architecture

```
Browser / Phone
      │
      ▼
React + Vite (JSX)          ← /feed, /submit, /post/:id, /profile
      │ Axios + httpOnly Cookie
      ▼
Node.js + Express            ← /api/*
      │ Mongoose
      ├──► MongoDB Atlas      ← users, posts, votes, categories, escalation_log
      │ Axios (internal)
      └──► Python FastAPI     ← /rank, /duplicate-check, /escalate-check, /moderate
```

---

## Confirmed Tech Decisions

| Decision | Choice |
|---|---|
| Frontend language | JavaScript (JSX) |
| Backend language | JavaScript (CommonJS) |
| ODM | Mongoose |
| JWT storage | httpOnly cookie |
| Algorithm service | Python FastAPI |
| Form validation | React Hook Form |
| Image storage | Cloudinary |
| Deployment | Render (unified server+client) |

---

## Route Structure

| URL | Access | Description |
|---|---|---|
| `/` | Public | Login page (redirects to /feed if logged in) |
| `/login` | Public | Login (same as /) |
| `/register` | Public | Register (name, email, password, faculty, phone) |
| `/feed` | Auth required | Main feed with tabs/search/filter |
| `/submit` | Auth required | Submit suggestion form |
| `/post/:id` | Auth required | Post detail |
| `/profile` | Auth required | User profile + avatar |
| `/change-password` | Auth required | Change password |
| `/forgot-password` | Public | Forgot password |
| `/reset-password/:token` | Public | Reset password |
| `/admin/login` | Public | Admin login |
| `/admin/dashboard` | Admin | Post management table |
| `/admin/reports` | Admin | Analytics report |
| `/admin/qr` | Admin | QR code generator |
| `/admin/manage-admins` | Superadmin | Create/deactivate admins |

---

## Algorithms

### Algorithm A — TDE-Rank (Trending Feed)
```
score = votes / (age_hours + 2) ^ 1.8
```
Runs in Python. Falls back to voteCount if algo-service is down.

### Algorithm B — Cosine Similarity (Duplicate Detection)
Compares title-to-title and body-to-body separately using TF-IDF.
Falls back to Jaccard similarity in Node.js if algo-service is down.
Threshold: 0.85 (Python) / 0.7 title or 0.4+0.4 combined (Node fallback)

### Algorithm C — PBE Escalation
```
deadline = threshold_hours * category_weight
```
Runs hourly via node-cron. Falls back to local JS calculation if algo-service is down.

### Algorithm D — MLCM (Multi-Layer Content Moderation)
Runs BEFORE every post is saved. All layers run locally in Node.js (no algo-service dependency for Layers 1 & 3).

| Layer | Check | Runs In |
|---|---|---|
| 1 | Vulgar words + spam patterns | Node.js (always) |
| 2 | ML toxicity score (detoxify) | Python (optional) |
| 3 | Campus relevance keywords | Node.js (always) |

Returns HTTP 422 if blocked. Post is saved with `flagged=true` if borderline.

---

## Security

- JWT in httpOnly cookie (XSS safe)
- Bcrypt password hashing (12 rounds)
- Rate limiting on POST /api/posts (5/hour per IP)
- Helmet HTTP security headers
- CORS whitelist
- Content moderation on every post submission
- Anonymous posts store only IP hash — real identity visible to admin only

---

## Deployment

| Service | URL |
|---|---|
| Frontend + Backend | https://voxcampus-3xzm.onrender.com |
| Algorithm Service | https://voxcampusalgo.onrender.com |
| Database | MongoDB Atlas |
