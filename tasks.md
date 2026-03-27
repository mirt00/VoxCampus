# tasks.md — Granular Task Breakdown

## Prefix Key
- `[FE]` — Frontend (React + Vite, JSX)
- `[BE]` — Backend (Node.js + Express, CommonJS)
- `[PY]` — Algorithm Service (Python + FastAPI)
- `[DB]` — Database / Mongoose Schemas
- `[OPS]` — Config, DevOps, Deployment

---

## Backlog

### Setup
- [OPS] Finalize folder structure (monorepo: /client, /server, /algo-service)
- [FE] Vite + React (JSX) project, install Tailwind, react-router-dom, axios, @tanstack/react-query, react-hot-toast, qrcode.react, date-fns
- [BE] Express project (CommonJS), install mongoose, jsonwebtoken, bcryptjs, cookie-parser, cors, helmet, express-rate-limit, node-cron, nodemailer, axios, dotenv, joi, nodemon
- [PY] Create virtual env, install fastapi uvicorn scikit-learn pymongo pydantic python-dotenv
- [DB] Connect MongoDB Atlas, get URI, configure .env
- [OPS] Create .env files for all three services

### Database (Mongoose)
- [DB] User schema (name, email, passwordHash, role, resetToken, resetTokenExpiry)
- [DB] Post schema (title, body, category ref, author subdoc, voteCount, tdeScore, status, isEscalated, assignedAdmin, adminNote)
- [DB] Vote schema (postId, userId, ipHash, unique compound indexes)
- [DB] Category schema (name, slug, weight, description)
- [DB] EscalationLog schema (postId, triggeredAt, escalatedTo, reason, notificationSent)
- [DB] Seed script for default categories with weights
- [DB] MongoDB text index on posts.title + posts.body

### Authentication
- [BE] POST /api/auth/register — bcrypt hash, save user, sign JWT, set httpOnly cookie
- [BE] POST /api/auth/login — verify password, sign JWT, set httpOnly cookie
- [BE] POST /api/auth/logout — clear cookie
- [BE] POST /api/auth/forgot-password — crypto token, hash + save, send email via Nodemailer
- [BE] POST /api/auth/reset-password/:token — find by token hash, update password, clear token
- [BE] POST /api/auth/change-password — authenticated, verify old password, update
- [BE] middleware/auth.js — read JWT from httpOnly cookie, attach req.user
- [BE] middleware/roleGuard.js — check req.user.role, return 403 if not allowed
- [FE] Admin login page (form, POST to /api/auth/login)
- [FE] Forgot password page (enter email → success message)
- [FE] Reset password page (token from URL params)
- [FE] Axios instance with withCredentials: true (sends cookies automatically)
- [FE] Axios 401 interceptor → redirect to /admin/login

### Posts
- [BE] POST /api/posts — Joi validate, call Python /duplicate-check, if score ≥ 0.85 return 409 with existingPostId, else save
- [BE] GET /api/posts?feed=trending — fetch posts, call Python /rank per post, sort by tdeScore
- [BE] GET /api/posts?feed=latest — sort by createdAt desc
- [BE] GET /api/posts?feed=top — sort by voteCount desc
- [BE] GET /api/posts?search=keyword — MongoDB $text search
- [BE] GET /api/posts?category=slug — filter by category
- [BE] GET /api/posts/:id — single post, populate category + assignedAdmin
- [PY] POST /rank — TDE-Rank: score = (votes-1) / (ageHours+2)^gravity
- [PY] POST /duplicate-check — TF-IDF vectorize all posts + new text, cosine similarity, return score + matchedPostId
- [FE] Public feed page — Trending / Latest / Top tabs using TanStack Query
- [FE] Search bar (debounced 400ms) on public feed
- [FE] Category filter chips on public feed
- [FE] PostCard component (title, body snippet, voteCount, status badge, category, date-fns timestamp)
- [FE] Submit form page (title, body, category select, anonymous toggle)
- [FE] On 409 response → react-hot-toast duplicate warning with link to existing post
- [FE] On 201 response → react-hot-toast success, reset form

### Voting
- [BE] POST /api/votes/:postId — check existing vote (userId or ipHash), insert, increment voteCount
- [BE] Anonymous vote: SHA256 hash of req.ip, check {postId, ipHash} unique index
- [FE] Vote button on PostCard with optimistic UI update
- [FE] Show already-voted state on page load (check from API or localStorage flag)

### Admin Dashboard
- [BE] GET /api/admin/posts — paginated (page, limit), filter by status/category/date
- [BE] PATCH /api/admin/posts/:id/status — update status + updatedAt
- [BE] PATCH /api/admin/posts/:id/assign — assign admin
- [BE] PATCH /api/admin/posts/:id/note — save admin note
- [BE] POST /api/admin/users — superadmin creates admin account
- [BE] PATCH /api/admin/users/:id/deactivate — deactivate admin
- [BE] GET /api/admin/users — list all admins (superadmin only)
- [FE] Admin dashboard table — sortable, filterable, paginated (TanStack Query)
- [FE] Status dropdown per row → PATCH on change
- [FE] Escalation badge (red) on posts where isEscalated=true
- [FE] Post detail modal — full text, admin note field, escalation history
- [FE] Admin user management page (list, create, deactivate)
- [FE] Change password page for logged-in admin

### Escalation Engine
- [PY] POST /escalate-check — deadline = thresholdHours × categoryWeight, return { shouldEscalate, deadlineHours, hoursElapsed }
- [BE] escalation.cron.js — node-cron every hour, fetch pending non-escalated posts
- [BE] For each post: call Python /escalate-check, if shouldEscalate → update post, write escalation_log, send email
- [FE] Escalation badge on admin dashboard rows

### QR Code
- [BE] GET /api/qr/url — return { url: process.env.CLIENT_URL + '/submit' }
- [FE] QR code page using qrcode.react (QRCodeSVG)
- [FE] Print button (window.print()) with print-only CSS to hide nav/buttons
- [FE] Mobile-responsive submit form (Tailwind responsive classes)

### Categories
- [BE] GET /api/categories — return all categories (used by frontend dropdowns)

### Security & Polish
- [BE] helmet() middleware on app
- [BE] cors({ origin: CLIENT_URL, credentials: true })
- [BE] express-rate-limit on POST /api/posts (max 5 per hour per IP)
- [BE] Joi validation middleware on all POST/PATCH routes
- [BE] Global error handler middleware (last middleware in chain)
- [FE] Loading spinners on all async actions
- [FE] Error toasts via react-hot-toast on failed requests

### Testing & Deployment
- [OPS] Postman collection for all endpoints
- [OPS] Deploy MongoDB → Atlas
- [OPS] Deploy Python service → Render
- [OPS] Deploy Node backend → Render
- [OPS] Deploy React frontend → Vercel
- [OPS] Update all .env files with production URLs
