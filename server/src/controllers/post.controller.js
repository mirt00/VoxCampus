const Post = require("../models/Post.model");
const Category = require("../models/Category.model");
const User = require("../models/User.model");
const { checkDuplicate, rankPost } = require("../services/python.service");
const hashIP = require("../utils/hashIP");

const createPost = async (req, res, next) => {
  try {
    const { title, body, category, authorType, attachments } = req.body;
    const trimmedTitle = title?.trim();
    const trimmedBody = body?.trim();

    if (!trimmedTitle || trimmedTitle.length < 3) {
      return res.status(400).json({ message: "Title must be at least 3 characters" });
    }
    if (!trimmedBody || trimmedBody.length < 3) {
      return res.status(400).json({ message: "Description must be at least 3 characters" });
    }

    // Duplicate check — try algo-service, fall back to local keyword similarity
    try {
      const existing = await Post.find({}, "title body _id").lean();
      const existingPosts = existing.map((p) => ({ id: p._id.toString(), title: p.title, body: p.body }));
      const dupResult = await checkDuplicate(`${trimmedTitle} ${trimmedBody}`, existingPosts);
      if (dupResult.is_duplicate) {
        return res.status(409).json({ message: "Similar post exists", existingPostId: dupResult.matched_post_id });
      }
    } catch {
      // algo-service down — compare title-to-title AND body-to-body separately using Jaccard
      const stopWords = new Set(["the","a","an","is","it","in","on","at","to","for","of","and","or","but","with","this","that","are","was","were","be","been","have","has","i","he","she","they","we","you","go","do","did","get","got","can","will","would","could","should"]);
      const tokenize = (text) => new Set(
        text.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w))
      );
      const jaccard = (setA, setB) => {
        if (setA.size === 0 && setB.size === 0) return 0;
        const intersection = [...setA].filter(w => setB.has(w)).length;
        const union = new Set([...setA, ...setB]).size;
        return union > 0 ? intersection / union : 0;
      };

      const newTitleTokens = tokenize(trimmedTitle);
      const newBodyTokens = tokenize(trimmedBody);
      const existing = await Post.find({}, "title body _id").lean();

      for (const p of existing) {
        const existingTitleTokens = tokenize(p.title || "");
        const existingBodyTokens = tokenize(p.body || "");

        const titleSim = jaccard(newTitleTokens, existingTitleTokens);
        const bodySim = jaccard(newBodyTokens, existingBodyTokens);

        // Block if title is very similar (≥0.7) OR both title+body are moderately similar
        if (titleSim >= 0.7 || (titleSim >= 0.4 && bodySim >= 0.4)) {
          return res.status(409).json({ message: "Similar post exists", existingPostId: p._id.toString() });
        }
      }
    }

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
      userId: req.user?.id || null, // always store userId for ownership checks
      displayName: authorType === "registered" ? displayName : "Anonymous",
      avatar: authorType === "registered" ? authorAvatar : null,
      ipHash: authorType === "anonymous" ? hashIP(req.ip) : null,
    };

    const post = await Post.create({ title: trimmedTitle, body: trimmedBody, category: categoryId, author, attachments: attachments || [] });
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
      .populate("author.userId", "name email faculty studentId avatar")
      .lean();

    // Determine if requester is admin (via cookie JWT)
    const jwt = require("jsonwebtoken");
    let requesterId = null;
    let requesterRole = "public";
    try {
      const token = req.cookies?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        requesterId = decoded.id;
        requesterRole = decoded.role;
      }
    } catch {}

    const isAdmin = ["admin", "superadmin"].includes(requesterRole);

    posts = posts.map((p) => {
      const isOwner = requesterId && String(p.author?.userId?._id || p.author?.userId) === String(requesterId);
      return {
        ...p,
        isOwner,
        // For anonymous posts: show real identity only to admin, hide from others
        author: {
          ...p.author,
          realIdentity: isAdmin && p.author?.type === "anonymous" ? p.author?.userId : undefined,
          // Keep userId for ownership check on frontend
          userId: p.author?.userId?._id || p.author?.userId,
        },
      };
    });

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
      .populate("assignedAdmin", "name email")
      .populate("author.userId", "name email faculty studentId avatar")
      .lean();
    if (!post) return res.status(404).json({ message: "Post not found" });

    const jwt = require("jsonwebtoken");
    let requesterId = null;
    let requesterRole = "public";
    try {
      const token = req.cookies?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        requesterId = decoded.id;
        requesterRole = decoded.role;
      }
    } catch {}

    const isAdmin = ["admin", "superadmin"].includes(requesterRole);
    const isOwner = requesterId && String(post.author?.userId?._id || post.author?.userId) === String(requesterId);

    res.json({
      ...post,
      isOwner,
      author: {
        ...post.author,
        realIdentity: isAdmin && post.author?.type === "anonymous" ? post.author?.userId : undefined,
        userId: post.author?.userId?._id || post.author?.userId,
      },
    });
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
