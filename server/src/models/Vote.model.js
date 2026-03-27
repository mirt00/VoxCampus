const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ipHash: String,
  },
  { timestamps: true }
);

voteSchema.index({ postId: 1, userId: 1 }, { unique: true, sparse: true });
voteSchema.index({ postId: 1, ipHash: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Vote", voteSchema);
