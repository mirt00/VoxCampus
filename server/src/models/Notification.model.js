const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    message: { type: String, required: true },
    postTitle: { type: String, required: true },
    authorName: { type: String, default: "Anonymous" },
    read: { type: Boolean, default: false },
    // "admin" = new post alert to all admins; "user" = status update to post author
    recipientType: { type: String, enum: ["admin", "user"], default: "admin" },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    newStatus: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
