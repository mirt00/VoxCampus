const mongoose = require("mongoose");

const escalationLogSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    triggeredAt: { type: Date, default: Date.now },
    escalatedTo: String,
    previousStatus: String,
    reason: String,
    notificationSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EscalationLog", escalationLogSchema);
