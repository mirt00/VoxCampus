const Vote = require("../models/Vote.model");
const Post = require("../models/Post.model");
const hashIP = require("../utils/hashIP");

const upvotePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (req.user) {
      // Registered user
      const existing = await Vote.findOne({ postId, userId: req.user.id });
      if (existing) {
        // Unvote
        await Vote.deleteOne({ _id: existing._id });
        const updated = await Post.findByIdAndUpdate(
          postId,
          { $inc: { voteCount: -1 } },
          { new: true }
        );
        return res.json({ voteCount: updated.voteCount, voted: false });
      }
      await Vote.create({ postId, userId: req.user.id });
    } else {
      // Anonymous user
      const ipHash = hashIP(req.ip);
      const existing = await Vote.findOne({ postId, ipHash });
      if (existing) {
        // Unvote
        await Vote.deleteOne({ _id: existing._id });
        const updated = await Post.findByIdAndUpdate(
          postId,
          { $inc: { voteCount: -1 } },
          { new: true }
        );
        return res.json({ voteCount: updated.voteCount, voted: false });
      }
      await Vote.create({ postId, ipHash });
    }

    const updated = await Post.findByIdAndUpdate(
      postId,
      { $inc: { voteCount: 1 } },
      { new: true }
    );
    res.json({ voteCount: updated.voteCount, voted: true });
  } catch (err) { next(err); }
};

module.exports = { upvotePost };
