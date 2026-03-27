# prompt.md — AI Prompts for Building the Project

Use these prompts with Claude (or any AI assistant) as you build each part.
Copy-paste directly. Replace `[BRACKETED]` values with your actual details.

---

## 1. Project Setup

### Folder Structure
```
Generate a clean MERN project folder structure for a campus suggestion platform.
Services: /client (React+Vite), /server (Node+Express), /algo-service (Python FastAPI).
Include subfolders for routes, models, controllers, middleware in /server.
Include components, pages, hooks, api folders in /client.
Show it as a tree diagram.
```

---

## 2. Database Schemas

### All Mongoose Schemas
```
Write Mongoose schemas for a campus complaint platform with these collections:
- users (name, email, passwordHash, role enum['user','admin','superadmin'], resetToken, resetTokenExpiry)
- posts (title, body, category ref, author subdoc with type enum['registered','anonymous'] + userId + ipHash, voteCount, tdeScore, status enum, isEscalated, assignedAdmin ref, adminNote)
- votes (postId ref, userId ref, ipHash, unique compound index)
- categories (name, slug, weight for escalation)
- escalation_log (postId, triggeredAt, escalatedTo, reason)
Include timestamps on all schemas. Export each model.
```

---

## 3. Authentication

### JWT Auth Routes
```
Write Express.js auth routes for a MERN app:
- POST /api/auth/register — hash password with bcrypt (12 rounds), save user, return JWT
- POST /api/auth/login — verify password, return JWT in httpOnly cookie
- POST /api/auth/forgot-password — generate crypto token, save hash + expiry to user, send email
- POST /api/auth/reset-password/:token — find user by token hash, update password, clear token
- POST /api/auth/change-password — authenticated, verify old password, update to new
Use jsonwebtoken, bcryptjs, nodemailer. Include JWT middleware separately.
```

### JWT Middleware
```
Write an Express.js middleware function that:
1. Reads JWT from httpOnly cookie named 'token'
2. Verifies with process.env.JWT_SECRET
3. Attaches decoded user to req.user
4. Returns 401 if token missing or invalid
Also write a roleGuard(roles) middleware factory that returns 403 if req.user.role not in roles array.
```

---

## 4. Posts API

### Post Routes
```
Write Express.js routes for posts in a campus complaint platform:
- POST /api/posts — validate with Joi, call internal Python service at process.env.PYTHON_SERVICE_URL/duplicate-check with title+body, if similarity >= 0.85 return 409 with existingPostId, else save to MongoDB
- GET /api/posts — support ?feed=trending|latest|top and ?search=keyword and ?category=slug, for trending feed call Python /rank for each post, sort by score
- GET /api/posts/:id — single post
Use mongoose Post model. Handle errors with next(err).
```

---

## 5. Voting API

### Vote Route
```
Write an Express.js route: POST /api/votes/:postId
Logic:
- If user is authenticated (req.user exists): check votes collection for {postId, userId} — if found return 400 "already voted"
- If anonymous: hash req.ip with crypto SHA256, check votes collection for {postId, ipHash} — if found return 400
- Insert new vote document
- Increment post voteCount by 1 using findByIdAndUpdate
- Return updated voteCount
```

---

## 6. Python Algorithm Service

### FastAPI Setup + All 3 Endpoints
```
Write a Python FastAPI application with three endpoints for a campus complaint platform:

1. POST /rank
   Body: { votes: int, ageHours: float, gravity: float = 1.8 }
   Formula: score = (votes - 1) / (ageHours + 2) ** gravity
   Return: { score: float }

2. POST /duplicate-check
   Body: { newText: str, existingPosts: list[{id: str, title: str, body: str}] }
   Use scikit-learn TfidfVectorizer + cosine_similarity
   Remove stop words, combine title+body as document
   Return: { isDuplicate: bool, score: float, matchedPostId: str | null }

3. POST /escalate-check
   Body: { submittedAt: datetime, categoryWeight: float, thresholdHours: int = 48 }
   Formula: deadline = thresholdHours * categoryWeight
   Return: { shouldEscalate: bool, deadlineHours: float, hoursElapsed: float }

Use pydantic for request/response models. Include CORS middleware.
```

---

## 7. Escalation Cron Job

### node-cron Escalation Job
```
Write a Node.js module using node-cron that runs every hour.
It should:
1. Query MongoDB for all posts where status='pending' and isEscalated=false
2. Populate the category field (to get weight)
3. For each post, call Python service POST /escalate-check with submittedAt, categoryWeight
4. If shouldEscalate is true:
   - Update post: isEscalated=true, escalatedAt=now, status stays pending
   - Insert document into escalation_log collection
   - Send email via nodemailer to process.env.ESCALATION_EMAIL with post title and details
5. Log results to console
Export a startEscalationJob() function.
```

---

## 8. React Frontend

### Public Feed Page
```
Write a React component for a public complaint feed page.
Features:
- Three tabs: Trending | Latest | Top (each calls GET /api/posts?feed=[type])
- Search bar that filters by keyword (debounced 400ms)
- Category filter chips (fetch from GET /api/categories)
- Renders a list of PostCard components
- Uses TanStack Query (react-query) for data fetching and caching
- Shows loading skeleton and error state
No login required. Mobile responsive with Tailwind CSS.
```

### Submit Form
```
Write a React submit form component for a campus complaint platform.
Fields: title (required), body (required, textarea), category (select from API), authorType toggle (Anonymous / My Name)
On submit:
- POST to /api/posts
- If response is 409 (duplicate), show a warning toast: "A similar complaint exists. Please upvote it instead." with a link to the existing post
- If 201, show success toast and reset form
Use react-hook-form for validation. Tailwind CSS styling. Mobile-first.
```

### Admin Dashboard Table
```
Write a React admin dashboard page component.
Features:
- Protected route (redirect to /admin/login if no JWT)
- Fetch posts from GET /api/admin/posts with pagination (page, limit)
- Table columns: title, category, votes, status (editable dropdown), submitted, escalated badge
- Status dropdown per row calls PATCH /api/admin/posts/:id/status on change
- Filter bar: status filter, category filter, date range
- Escalated posts show a red badge
Use TanStack Query. Tailwind CSS.
```

---

## 9. QR Code

### QR Code Admin Page
```
Write a React component that displays a printable QR code for a campus suggestion platform.
- Fetch submission URL from GET /api/qr/url
- Display QR code using qrcode.react (QRCodeSVG component)
- Show the URL as text below
- Include a "Print QR Code" button that calls window.print()
- Add print-specific CSS to hide nav/buttons when printing
Tailwind CSS styling.
```

---

## 10. Debugging Prompts

### Cosine Similarity Returns Unexpected Score
```
I'm using scikit-learn TfidfVectorizer and cosine_similarity in Python.
My two texts are: "[TEXT_A]" and "[TEXT_B]"
Expected similarity: high (they mean the same thing)
Actual score: [SCORE]
Here is my code: [PASTE CODE]
What might be causing low scores and how do I fix it?
```

### JWT Not Persisting Across Requests
```
I'm storing JWT in an httpOnly cookie in my Express app.
Frontend is React on localhost:5173, backend on localhost:5000.
The cookie is set correctly on login but not sent on subsequent requests.
Here is my cors config: [PASTE]
Here is my axios config: [PASTE]
What is the fix?
```

### MongoDB Vote Duplicate Not Being Caught
```
I have a votes collection with a unique compound index on {postId, userId}.
Users are still able to vote multiple times.
Here is my Mongoose schema: [PASTE]
Here is my vote route: [PASTE]
Why is the duplicate check not working?
```
