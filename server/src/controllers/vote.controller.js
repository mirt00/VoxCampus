const Vote = require("../models/Vote.model");
const Post = require("../models/Post.model");
const hashIP = require("../utils/hashIP");

const upvotePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (req.user) {
      const existing = await Vote.findOne({ postId, userId: req.user.id });
      if (existing) return res.status(400).json({ message: "Already voted" });
      await Vote.create({ postId, userId: req.user.id });
    } else {
      const ipHash = hashIP(req.ip);
      const existing = await Vote.findOne({ postId, ipHash });
      if (existing) return res.status(400).json({ message: "Already voted" });
      await Vote.create({ postId, ipHash });
    }

    const updated = await Post.findByIdAndUpdate(postId, { $inc: { voteCount: 1 } }, { new: true });
    res.json({ voteCount: updated.voteCount });
  } catch (err) { next(err); }
};

module.exports = { upvotePost };
