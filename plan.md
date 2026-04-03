# plan.md — VoxCampus Development Plan

## Status: Completed ✅

All phases have been implemented and deployed.

---

## What Was Built

### Authentication
- Register: name, email, password, faculty (BCA/CSIT/BBM/BBA/BBS/+2/B.Ed), phone
- Login with httpOnly JWT cookie
- Forgot password / reset password via email link
- Change password (with current password verification)
- Profile page with avatar upload (Cloudinary)
- Auto-redirect: `/` and `/login` redirect to `/feed` if already logged in

### Posts
- Submit suggestion with title, body, category, images (Cloudinary), identity toggle
- Anonymous or named posting (userId always stored for ownership)
- Edit and delete own posts (three-dot menu)
- Admin public feedback visible on post detail
- Optimistic UI on post creation

### Feed
- Trending / Latest / Top tabs (URL query params: `?feed=trending`)
- Search with debounce (URL: `?search=keyword`)
- Category filter chips (URL: `?category=id`)
- Skeleton loading states
- Floating + button for mobile

### Voting
- Upvote / unvote toggle
- Optimistic UI
- Deduplication by userId (registered) or IP hash (anonymous)

### Admin
- Dashboard with author avatar, name, status dropdown, escalation badge, flagged badge
- Post detail with real identity reveal for anonymous posts
- Public admin response (visible to all users)
- Internal admin note (admin only)
- Reports/Analytics page: KPIs, resolution rate, status breakdown, top categories, top posts
- QR code generator
- Manage admins (superadmin only)

### Algorithms
- A: TDE-Rank trending feed
- B: Cosine similarity duplicate detection (with Jaccard fallback)
- C: PBE escalation (hourly cron, with local fallback)
- D: MLCM content moderation (3 layers, Layers 1+3 always run locally)

### Deployment
- Frontend + Backend unified on Render
- Algorithm service on Render (keep-alive ping every 14 min)
- MongoDB Atlas
- Cloudinary for images
