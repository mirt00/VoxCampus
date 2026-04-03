# schema.md — MongoDB Collections (Mongoose)

## Collection: `users`

```js
{
  _id: ObjectId,
  name: String,                          // alphabets only, min 3
  email: { type: String, unique: true },
  passwordHash: String,                  // bcrypt, 12 rounds
  role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
  faculty: { type: String, enum: ["BCA","CSIT","BBM","BBA","BBS","+2","B.Ed"] },
  phone: String,                         // 10 digits
  avatar: String,                        // Cloudinary URL
  isActive: { type: Boolean, default: true },
  resetToken: String,
  resetTokenExpiry: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Collection: `posts`

```js
{
  _id: ObjectId,
  title: { type: String, required: true, maxlength: 150 },
  body: { type: String, required: true, maxlength: 2000 },
  category: { type: ObjectId, ref: "Category" },

  author: {
    type: { type: String, enum: ["registered", "anonymous"] },
    userId: { type: ObjectId, ref: "User" },  // always stored for ownership
    displayName: String,
    avatar: String,
    ipHash: String
  },

  voteCount: { type: Number, default: 0 },
  tdeScore: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["pending", "in-progress", "resolved", "rejected"],
    default: "pending"
  },

  isEscalated: { type: Boolean, default: false },
  escalatedAt: Date,
  escalatedTo: String,

  assignedAdmin: { type: ObjectId, ref: "User" },
  adminNote: String,        // internal, admin only
  adminFeedback: String,    // public response visible to all users

  // Algorithm D — MLCM fields
  flagged: { type: Boolean, default: false },
  toxicityScore: { type: Number, default: 0.0 },
  moderationReason: String,

  attachments: [String],    // Cloudinary URLs
  createdAt: Date,
  updatedAt: Date
}
```

---

## Collection: `votes`

```js
{
  _id: ObjectId,
  postId: { type: ObjectId, ref: "Post" },
  userId: { type: ObjectId, ref: "User" },   // registered users
  ipHash: String,                             // anonymous voters
  createdAt: Date
}
```

Indexes:
- `{ postId, userId }` unique sparse
- `{ postId, ipHash }` unique with partialFilterExpression (ipHash exists)

---

## Collection: `categories`

```js
{
  _id: ObjectId,
  name: String,
  slug: String,
  weight: { type: Number, default: 1.0 },   // PBE escalation weight
  description: String,
  createdAt: Date
}
```

---

## Collection: `escalation_log`

```js
{
  _id: ObjectId,
  postId: { type: ObjectId, ref: "Post" },
  triggeredAt: Date,
  escalatedTo: String,
  previousStatus: String,
  reason: String,
  notificationSent: Boolean,
  createdAt: Date
}
```
