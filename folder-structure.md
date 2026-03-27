# folder-structure.md — Sujabpatika Digital

## Root
```
VoxCampus/
├── client/                  # React + Vite frontend
├── server/                  # Node.js + Express backend
├── algo-service/            # Python FastAPI algorithm service
├── .gitignore
└── README.md
```

---

## /client (React + Vite)
```
client/
├── public/
│   └── vite.svg
├── src/
│   ├── api/                         # Axios instances & API call functions
│   │   ├── axiosInstance.js         # Base axios with cookie/interceptor config
│   │   ├── posts.api.js             # getAllPosts, createPost, getPostById
│   │   ├── votes.api.js             # upvotePost
│   │   ├── auth.api.js              # login, logout, forgotPassword, resetPassword
│   │   └── admin.api.js             # admin CRUD, status updates
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── PostCard.jsx             # Single post display (votes, status, category)
│   │   ├── FeedTabs.jsx             # Trending / Latest / Top toggle
│   │   ├── CategoryFilter.jsx       # Filter chips for categories
│   │   ├── SearchBar.jsx            # Debounced search input
│   │   ├── VoteButton.jsx           # Upvote button with optimistic UI
│   │   ├── StatusBadge.jsx          # Color-coded status pill
│   │   ├── DuplicateWarning.jsx     # Toast/modal when duplicate detected
│   │   ├── QRCodeDisplay.jsx        # QR code + print button
│   │   ├── Navbar.jsx               # Public navbar
│   │   ├── AdminNavbar.jsx          # Admin sidebar/topbar
│   │   └── ProtectedRoute.jsx       # Redirects to login if no JWT
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── Feed.jsx             # Public feed page (Trending/Latest/Top)
│   │   │   ├── SubmitPost.jsx       # Complaint submission form
│   │   │   └── PostDetail.jsx       # Single post detail view
│   │   │
│   │   └── admin/
│   │       ├── AdminLogin.jsx       # Admin login form
│   │       ├── ForgotPassword.jsx   # Enter email to get reset link
│   │       ├── ResetPassword.jsx    # Reset password via token URL
│   │       ├── Dashboard.jsx        # Main admin table (posts, filters, status)
│   │       ├── PostDetailAdmin.jsx  # Full post + admin note + escalation log
│   │       ├── ManageAdmins.jsx     # Superadmin: create/deactivate admins
│   │       ├── ChangePassword.jsx   # Admin changes own password
│   │       └── QRPage.jsx           # Printable QR code page
│   │
│   ├── hooks/
│   │   ├── useAuth.js               # Auth state (user, login, logout)
│   │   ├── usePosts.js              # react-query hooks for posts
│   │   └── useVote.js               # Vote mutation hook
│   │
│   ├── context/
│   │   └── AuthContext.jsx          # Global auth state provider
│   │
│   ├── utils/
│   │   ├── timeAgo.js               # "2 hours ago" formatter (date-fns)
│   │   └── hashIP.js                # Client-side anonymous ID helper
│   │
│   ├── App.jsx                      # Route definitions
│   ├── main.jsx                     # Vite entry point
│   └── index.css                    # Tailwind directives
│
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## /server (Node.js + Express)
```
server/
├── src/
│   ├── config/
│   │   ├── db.js                    # MongoDB connection (mongoose.connect)
│   │   └── mailer.js                # Nodemailer transporter setup
│   │
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Post.model.js
│   │   ├── Vote.model.js
│   │   ├── Category.model.js
│   │   └── EscalationLog.model.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js           # /api/auth/*
│   │   ├── post.routes.js           # /api/posts/*
│   │   ├── vote.routes.js           # /api/votes/*
│   │   ├── admin.routes.js          # /api/admin/*
│   │   └── qr.routes.js             # /api/qr/*
│   │
│   ├── controllers/
│   │   ├── auth.controller.js       # register, login, forgot, reset, change
│   │   ├── post.controller.js       # createPost, getPosts, getPostById
│   │   ├── vote.controller.js       # upvotePost
│   │   ├── admin.controller.js      # updateStatus, assignAdmin, manageUsers
│   │   └── qr.controller.js         # getQRUrl
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js       # verifyJWT → attaches req.user
│   │   ├── role.middleware.js       # roleGuard(['admin','superadmin'])
│   │   ├── rateLimiter.js           # express-rate-limit for /api/posts
│   │   ├── validate.js              # Joi validation wrapper
│   │   └── errorHandler.js          # Global error handler
│   │
│   ├── services/
│   │   ├── python.service.js        # Axios calls to FastAPI (rank, duplicate, escalate)
│   │   └── mail.service.js          # Send escalation/reset emails
│   │
│   ├── jobs/
│   │   └── escalation.job.js        # node-cron hourly PBE escalation check
│   │
│   ├── validators/
│   │   ├── post.validator.js        # Joi schema for post body
│   │   └── auth.validator.js        # Joi schema for auth bodies
│   │
│   └── utils/
│       ├── generateToken.js         # JWT sign helper
│       └── hashIP.js                # SHA256 hash of IP address
│
├── seeds/
│   └── categories.seed.js           # Insert default categories with weights
│
├── app.js                           # Express app setup (middleware, routes)
├── server.js                        # Entry point (listen + start cron job)
├── .env
└── package.json
```

---

## /algo-service (Python FastAPI)
```
algo-service/
├── app/
│   ├── main.py                      # FastAPI app entry point, CORS, route includes
│   │
│   ├── routers/
│   │   ├── rank.py                  # POST /rank — TDE-Rank (Algorithm A)
│   │   ├── duplicate.py             # POST /duplicate-check — Cosine Similarity (Algorithm B)
│   │   └── escalate.py              # POST /escalate-check — PBE (Algorithm C)
│   │
│   ├── schemas/
│   │   ├── rank_schema.py           # Pydantic models for /rank
│   │   ├── duplicate_schema.py      # Pydantic models for /duplicate-check
│   │   └── escalate_schema.py       # Pydantic models for /escalate-check
│   │
│   ├── services/
│   │   ├── tde_rank.py              # TDE-Rank formula logic
│   │   ├── cosine_similarity.py     # TF-IDF + cosine_similarity logic
│   │   └── pbe_escalation.py        # PBE deadline + trigger logic
│   │
│   └── utils/
│       └── text_cleaner.py          # Strip stop words, lowercase, clean text
│
├── tests/
│   ├── test_rank.py
│   ├── test_duplicate.py
│   └── test_escalate.py
│
├── requirements.txt                 # fastapi uvicorn scikit-learn pymongo pydantic
├── .env
└── README.md
```

---

## Key File Responsibilities

| File | What it does |
|---|---|
| `server/app.js` | Mounts all routes, applies helmet/cors/rateLimiter |
| `server/server.js` | Calls `app.listen()` and `startEscalationJob()` |
| `server/src/services/python.service.js` | Single place for all calls to FastAPI |
| `algo-service/app/main.py` | Registers all 3 routers, adds CORS |
| `client/src/App.jsx` | All React routes (public + admin protected) |
| `client/src/context/AuthContext.jsx` | Shares login state across all components |
