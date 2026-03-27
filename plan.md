# plan.md — VoxCampus Development Plan

## Project Name
**VoxCampus** — Campus Suggestion & Complaint Management Platform

## Stack Confirmed
- Frontend: React + Vite (JSX, no TypeScript)
- Backend: Node.js + Express.js (CommonJS, no TypeScript)
- ODM: Mongoose (not Prisma)
- Auth: JWT in httpOnly cookie
- Algorithm Service: Python FastAPI (separate service)

---

## Phase 1: Setup & Foundation (Week 1)

- [ ] Finalize folder structure (monorepo: /client, /server, /algo-service)
- [ ] Setup React + Vite (JSX) with Tailwind CSS
- [ ] Setup Node.js + Express (CommonJS) with folder structure
- [ ] Setup Python FastAPI with virtual environment
- [ ] Connect MongoDB Atlas, get URI
- [ ] Configure .env files for all three services
- [ ] Write all Mongoose schemas (users, posts, votes, categories, escalation_log)
- [ ] Seed categories collection with default weights
- [ ] Confirm all three services start without errors

---

## Phase 2: Authentication (Week 2)

- [ ] POST /api/auth/register — hash password, save user, set JWT httpOnly cookie
- [ ] POST /api/auth/login — verify password, set JWT httpOnly cookie
- [ ] POST /api/auth/logout — clear cookie
- [ ] POST /api/auth/forgot-password — generate token, send reset email via Nodemailer
- [ ] POST /api/auth/reset-password/:token — validate token, update password
- [ ] POST /api/auth/change-password — authenticated user changes own password
- [ ] JWT middleware (reads httpOnly cookie)
- [ ] Role guard middleware (admin, superadmin)
- [ ] Admin login page (React)
- [ ] Forgot password + reset password pages (React)
- [ ] Axios configured with withCredentials: true

---

## Phase 3: Post Submission & Feed (Week 3)

- [ ] POST /api/posts — Joi validate, call Python /duplicate-check, save to MongoDB
- [ ] GET /api/posts?feed=trending — fetch, call Python /rank per post, sort by score
- [ ] GET /api/posts?feed=latest — sort by createdAt desc
- [ ] GET /api/posts?feed=top — sort by voteCount desc
- [ ] GET /api/posts?search=keyword — MongoDB text index search
- [ ] GET /api/posts/:id — single post
- [ ] Python POST /duplicate-check (Cosine Similarity — Algorithm B)
- [ ] Python POST /rank (TDE-Rank — Algorithm A)
- [ ] Public feed page (React) — tabs, search bar, category filter chips
- [ ] Submit form page (React) — anonymous or named, category select
- [ ] PostCard component — title, body, votes, status badge, "X ago"
- [ ] Duplicate warning toast on 409 response

---

## Phase 4: Voting (Week 4)

- [ ] POST /api/votes/:postId — deduplicate by userId or ipHash
- [ ] Increment voteCount on post after vote
- [ ] Anonymous vote by SHA256 IP hash
- [ ] Vote button state in React (voted / not voted)
- [ ] Optimistic UI update on vote

---

## Phase 5: Admin Dashboard (Week 5)

- [ ] GET /api/admin/posts — paginated, filterable (status, category, date)
- [ ] PATCH /api/admin/posts/:id/status — update status
- [ ] PATCH /api/admin/posts/:id/assign — assign to admin
- [ ] POST /api/admin/users — superadmin creates admin
- [ ] PATCH /api/admin/users/:id/deactivate — deactivate admin
- [ ] Admin dashboard table (React) — sortable, filterable, paginated
- [ ] Status dropdown per row
- [ ] Post detail modal — full text, admin note, escalation history
- [ ] Admin user management page
- [ ] Escalation badge on overdue posts

---

## Phase 6: Escalation Engine (Week 6)

- [ ] Python POST /escalate-check (PBE — Algorithm C)
- [ ] node-cron job (hourly) in backend
- [ ] On escalation: update post, write escalation_log, send email
- [ ] Escalation badge visible in admin dashboard

---

## Phase 7: QR Code & Public UX (Week 7)

- [ ] GET /api/qr/url — returns submission URL
- [ ] QR code page in admin panel using qrcode.react
- [ ] Print button (window.print()) with print CSS
- [ ] Mobile-responsive submit form
- [ ] Category filter + search on public feed

---

## Phase 8: Polish, Security & Deployment (Week 8–10)

- [ ] Helmet + CORS configuration
- [ ] express-rate-limit on POST /api/posts (5/hour per IP)
- [ ] Joi validation on all endpoints
- [ ] Global error handler middleware
- [ ] Axios 401 interceptor → redirect to login
- [ ] Loading states and error toasts
- [ ] Postman collection for all endpoints
- [ ] Deploy: MongoDB Atlas + Render (backend + Python) + Vercel (frontend)
- [ ] Final README with setup instructions

---

## Milestone Summary

| Week | Milestone |
|---|---|
| 1 | All 3 services running locally, DB connected, schemas done |
| 2 | Auth fully working (httpOnly cookie, roles, forgot password) |
| 3 | Posts submit with duplicate check, feed loads with ranking |
| 4 | Voting works, no duplicates |
| 5 | Admin dashboard functional |
| 6 | Escalation engine running on schedule |
| 7 | QR code working, mobile responsive |
| 8–10 | Security, polish, deployment, final report |
