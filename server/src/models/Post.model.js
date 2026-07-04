const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 150 },
    body: { type: String, required: true, maxlength: 2000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    author: {
      type: { type: String, enum: ["registered", "anonymous"], required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      displayName: String,
      avatar: String,
      ipHash: String,
    },

    voteCount: { type: Number, default: 0 },
    tdeScore: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "rejected"],
      default: "pending",
    },

    isEscalated: { type: Boolean, default: false },
    escalatedAt: Date,
    escalatedTo: String,

    assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminNote: String,       // internal note (admin only)
    adminFeedback: String,   // public response shown to all users
    flagged: { type: Boolean, default: false },
    toxicityScore: { type: Number, default: 0.0 },
    moderationReason: { type: String, default: null },
    attachments: [String], // base64 images or URLs
    adminFeedbackImages: [String],
  },
  { timestamps: true }
);

postSchema.index({ category: 1, status: 1 });
postSchema.index({ tdeScore: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ voteCount: -1 });
postSchema.index({ title: "text", body: "text" });

module.exports = mongoose.model("Post", postSchema);
