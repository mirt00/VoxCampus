# schema.md — MongoDB Collections (Mongoose)

## Collection: `users`

```js
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true, required: true },
  passwordHash: String,                          // bcrypt, 12 rounds
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  resetToken: String,                            // SHA256 hashed reset token
  resetTokenExpiry: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

---

## Collection: `posts`

```js
{
  _id: ObjectId,
  title: { type: String, required: true, maxLength: 150 },
  body: { type: String, required: true, maxLength: 2000 },
  category: { type: ObjectId, ref: 'Category', required: true },

  author: {
    type: { type: String, enum: ['registered', 'anonymous'] },
    userId: { type: ObjectId, ref: 'User' },     // null if anonymous
    displayName: String,                          // shown on card
    ipHash: String                               // SHA256 hashed IP
  },

  voteCount: { type: Number, default: 1 },       // starts at 1 (submitter's vote)
  tdeScore: { type: Number, default: 0 },        // recomputed by Python TDE-Rank

  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },

  isEscalated: { type: Boolean, default: false },
  escalatedAt: Date,
  escalatedTo: String,

  assignedAdmin: { type: ObjectId, ref: 'User' },
  adminNote: String,

  attachments: [String],                         // file URLs (future)

  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

Indexes:
- `{ category: 1, status: 1 }` — admin filter queries
- `{ tdeScore: -1 }` — trending feed sort
- `{ createdAt: -1 }` — latest feed sort
- `{ voteCount: -1 }` — top feed sort
- `{ title: 'text', body: 'text' }` — keyword search

---

## Collection: `votes`

```js
{
  _id: ObjectId,
  postId: { type: ObjectId, ref: 'Post', required: true },
  userId: { type: ObjectId, ref: 'User' },       // set for registered users
  ipHash: String,                                // set for anonymous voters
  createdAt: { type: Date, default: Date.now }
}
```

Indexes:
- `{ postId: 1, userId: 1 }` unique — registered user votes once per post
- `{ postId: 1, ipHash: 1 }` unique — anonymous votes once per IP per post

---

## Collection: `categories`

```js
{
  _id: ObjectId,
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  weight: { type: Number, default: 1.0 },        // PBE escalation weight
  description: String,
  createdAt: { type: Date, default: Date.now }
}
```

Default seed data:

| Category | Weight | Escalation Deadline |
|---|---|---|
| Infrastructure / Burst Pipe | 0.5 | 24 hours |
| Safety / Emergency | 0.5 | 24 hours |
| Academic / Exam Issues | 0.75 | 36 hours |
| Facilities / Maintenance | 1.0 | 48 hours |
| Services / Admin | 1.25 | 60 hours |
| General Suggestion | 1.5 | 72 hours |

---

## Collection: `escalation_log`

```js
{
  _id: ObjectId,
  postId: { type: ObjectId, ref: 'Post' },
  triggeredAt: Date,
  escalatedTo: String,
  previousStatus: String,
  reason: String,
  notificationSent: Boolean,
  createdAt: { type: Date, default: Date.now }
}
```

---

## Relationships

```
users ──────────── posts (author.userId)
users ──────────── posts (assignedAdmin)
users ──────────── votes (userId)
posts ──────────── votes (postId)
posts ──────────── categories (category)
posts ──────────── escalation_log (postId)
```
