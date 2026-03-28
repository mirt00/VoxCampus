const Post = require("../models/Post.model");
const Category = require("../models/Category.model");
const User = require("../models/User.model");
const { checkDuplicate, rankPost } = require("../services/python.service");
const hashIP = require("../utils/hashIP");

const createPost = async (req, res, next) => {
  try {
    const { title, body, category, authorType, attachments } = req.body;

    // Duplicate check — skip gracefully if algo-service is down
    try {
      const existing = await Post.find({}, "title body _id").lean();
      const existingPosts = existing.map((p) => ({ id: p._id.toString(), title: p.title, body: p.body }));
      const dupResult = await checkDuplicate(`${title} ${body}`, existingPosts);
      if (dupResult.is_duplicate) {
        return res.status(409).json({ message: "Similar post exists", existingPostId: dupResult.matched_post_id });
      }
    } catch { /* algo-service unavailable */ }

    // Find or create category by name (skip if empty)
    let categoryId = null;
    if (category) {
      let categoryDoc = await Category.findOne({ name: category });
      if (!categoryDoc) {
        categoryDoc = await Category.create({
          name: category,
          slug: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          weight: 1.0,
        });
      }
      categoryId = categoryDoc._id;
    }

    // Resolve display name and avatar
    let displayName = "Anonymous";
    let authorAvatar = null;
    if (authorType === "registered" && req.user?.id) {
      const userDoc = await User.findById(req.user.id).select("name avatar");
      displayName = userDoc?.name || "User";
      authorAvatar = userDoc?.avatar || null;
    }

    const author = {
      type: authorType,
      userId: authorType === "registered" ? req.user?.id : null,
      displayName: authorType === "registered" ? displayName : "Anonymous",
      avatar: authorType === "registered" ? authorAvatar : null,
      ipHash: authorType === "anonymous" ? hashIP(req.ip) : null,
    };

    const post = await Post.create({ title, body, category: categoryId, author, attachments: attachments || [] });
    res.status(201).json(post);
  } catch (err) { next(err); }
};

const getPosts = async (req, res, next) => {
  try {
    const { feed = "latest", search, category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    let posts = await Post.find(filter)
      .populate("category", "name slug")
      .populate("assignedAdmin", "name email")
      .lean();

    if (feed === "trending") {
      const now = Date.now();
      posts = await Promise.all(
        posts.map(async (p) => {
          try {
            const ageHours = (now - new Date(p.createdAt).getTime()) / 3600000;
            const score = await rankPost(p.voteCount, ageHours);
            return { ...p, tdeScore: score };
          } catch {
            return { ...p, tdeScore: p.voteCount };
          }
        })
      );
      posts.sort((a, b) => b.tdeScore - a.tdeScore);
    } else if (feed === "top") {
      posts.sort((a, b) => b.voteCount - a.voteCount);
    } else {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(posts);
  } catch (err) { next(err); }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("category", "name slug weight")
      .populate("assignedAdmin", "name email");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) { next(err); }
};

const updatePost = async (req, res, next) => {
  try {
    const { title, body, category } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author?.userId?.toString() !== req.user?.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (title) post.title = title;
    if (body) post.body = body;
    if (category) {
      let categoryDoc = await Category.findOne({ name: category });
      if (!categoryDoc) {
        categoryDoc = await Category.create({
          name: category,
          slug: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          weight: 1.0,
        });
      }
      post.category = categoryDoc._id;
    }
    await post.save();
    res.json(post);
  } catch (err) { next(err); }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isAuthor = post.author?.userId?.toString() === req.user?.id;
    const isAdmin = ["admin", "superadmin"].includes(req.user?.role);
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (err) { next(err); }
};

module.exports = { createPost, getPosts, getPostById, updatePost, deletePost };
