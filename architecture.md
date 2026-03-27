# architecture.md — VoxCampus (Campus Suggestion Platform)

## System Overview

A web-based campus suggestion platform replacing the physical suggestion box. Students and staff submit complaints/suggestions via QR code or direct URL. The public feed shows ranked posts with voting. Admins manage, escalate, and resolve issues.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│   React + Vite (SPA) — JSX only, no TypeScript             │
│   Public Feed │ Submit Form │ Admin Dashboard │ QR Entry    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST (JSON)
                           │ Axios + httpOnly Cookie (JWT)
┌──────────────────────────▼──────────────────────────────────┐
│                       API LAYER                             │
│   Node.js + Express.js (CommonJS)                           │
│   Auth │ Post │ Vote │ Admin │ QR │ Category Routes         │
└───────┬───────────────────────────────────┬─────────────────┘
        │ Mongoose ODM                       │ HTTP (internal)
┌───────▼──────────────┐         ┌──────────▼────────────────┐
│     DATA LAYER       │         │    ALGORITHM SERVICE       │
│   MongoDB Atlas      │         │   Python (FastAPI)         │
│   users, posts,      │         │   TDE-Rank (Algorithm A)  │
│   votes, categories, │         │   Cosine Sim (Algorithm B) │
│   escalation_log     │         │   PBE Escalation (Algo C)  │
└──────────────────────┘         └───────────────────────────┘
```

---

## Confirmed Tech Decisions

| Decision | Choice |
|---|---|
| Frontend language | JavaScript (JSX) — no TypeScript |
| Backend language | JavaScript (CommonJS) — no TypeScript |
| ODM | Mongoose (not Prisma) |
| JWT storage | httpOnly cookie (not localStorage) |
| Algorithm service | Python FastAPI (separate service) |
| Styling | Tailwind CSS v3 |
| State / data fetching | TanStack Query (react-query) |
| Notifications | react-hot-toast |
| Timestamps | date-fns |
| QR display | qrcode.react (frontend) |
| Validation | Joi (backend) |
| Security | helmet + cors + express-rate-limit |
| Email | Nodemailer |
| Scheduler | node-cron |

---

## Component Breakdown

### 1. Frontend — React + Vite (JSX)

| Component | Responsibility |
|---|---|
| `PublicFeed` | Trending / Latest / Top tabs, search bar, category filter chips |
| `SubmitForm` | Anonymous or named submission, duplicate warning on 409 |
| `PostCard` | Title, body snippet, vote button, status badge, category, "X ago" |
| `AdminLogin` | JWT cookie-based login |
| `AdminDashboard` | Paginated table, status dropdown, escalation badge, filters |
| `AdminPanel` | Manage admin accounts, assign roles (superadmin only) |
| `QRPage` | Display + print QR code using qrcode.react |

### 2. Backend — Node.js + Express.js (CommonJS)

| Module | Responsibility |
|---|---|
| `auth.routes.js` | Register, login (httpOnly cookie), forgot/reset/change password |
| `post.routes.js` | CRUD posts, calls Python for duplicate check + ranking |
| `vote.routes.js` | Upvote, deduplication by userId or ipHash |
| `admin.routes.js` | Status updates, assign admin, admin user CRUD |
| `category.routes.js` | List categories (used by frontend dropdowns) |
| `qr.routes.js` | Return submission URL for QR generation |
| `escalation.cron.js` | node-cron hourly job — calls Python PBE, sends email alerts |
| `middleware/auth.js` | JWT cookie verification, role guard |
| `middleware/validate.js` | Joi schema validation wrapper |
| `middleware/errorHandler.js` | Global error handler |
| `middleware/rateLimiter.js` | express-rate-limit on submit endpoint |

### 3. Algorithm Service — Python (FastAPI)

| Endpoint | Algorithm | Description |
|---|---|---|
| `POST /rank` | TDE-Rank (Algorithm A) | Score = (votes-1) / (ageHours+2)^gravity |
| `POST /duplicate-check` | Cosine Similarity (Algorithm B) | TF-IDF vectorize, return score + matchedPostId |
| `POST /escalate-check` | PBE (Algorithm C) | deadline = threshold × categoryWeight, return shouldEscalate |

### 4. Database — MongoDB (Mongoose)

Collections: `users`, `posts`, `votes`, `categories`, `escalation_log`
(See schema.md for full field definitions)

---

## Data Flow: Submitting a Post

```
User fills form
      │
      ▼
React POST /api/posts (cookie sent automatically)
      │
      ▼
Express validates with Joi
      │
      ▼
Express calls Python POST /duplicate-check
      │
   Score ≥ 0.85? ──YES──► Return 409 { existingPostId }
      │ NO                  React shows duplicate warning toast
      ▼
Save post to MongoDB
      │
      ▼
Return 201 to React → success toast
```

## Data Flow: Loading Trending Feed

```
React GET /api/posts?feed=trending
      │
      ▼
Express fetches recent posts from MongoDB
      │
      ▼
For each post → calls Python POST /rank (TDE-Rank score)
      │
      ▼
Sorts by score descending → returns ranked list
```

## Data Flow: Escalation (Hourly Cron)

```
node-cron fires every hour
      │
      ▼
Fetch all posts { status: 'pending', isEscalated: false }
      │
      ▼
For each post → Python POST /escalate-check
      │
   shouldEscalate? ──YES──► Update post isEscalated=true
      │                      Insert escalation_log document
      │                      Send email via Nodemailer
      ▼
Log results to console
```

---

## Security

- JWT in httpOnly cookie (not localStorage) — XSS safe
- Bcrypt password hashing (salt rounds: 12)
- Rate limiting on POST /api/posts (5/hour per IP)
- Anonymous posts store only SHA256 IP hash (not raw IP)
- Admin routes protected by role middleware
- Helmet HTTP security headers
- CORS whitelist (only frontend origin allowed)
- Python service on internal network only (not public)
- Joi validation on all POST/PATCH inputs
