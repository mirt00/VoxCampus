const Post = require("../models/Post.model");
const Category = require("../models/Category.model");
const User = require("../models/User.model");
const Notification = require("../models/Notification.model");
const { checkDuplicate, rankPost, checkModeration } = require("../services/python.service");
const hashIP = require("../utils/hashIP");
const { getIO } = require("../utils/socket");

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
      const dupResult = await checkDuplicate(trimmedTitle, trimmedBody, existingPosts);
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

    // ── ALGORITHM D: Multi-Layer Content Moderation ──────────────────
    let postFlagged = false;
    let toxicityScore = 0.0;
    let moderationReason = null;

    const MODERATION_MESSAGES = {
      blocked_keyword: "Your post contains inappropriate language. Please revise and resubmit.",
      spam_pattern: "Your post looks like spam. Please write a genuine campus suggestion.",
      toxic_content: "Your post was flagged for harmful content. Please keep it respectful.",
      irrelevant: "Your post does not appear to be related to campus issues. Please describe a specific campus concern.",
    };

    // Local blocklist — always runs regardless of algo-service status
    const VULGAR_WORDS = [
      "damn","crap","idiot","stupid","fool","dumb","loser","hate","kill","shut up",
      "wtf","hell","bastard","fuck","bitch","shit","dick","pussy","cock",
      "whore","slut","nigger","faggot","retard","cunt",
      "muji","randi","kutta","sala","gadhaa","haramee","bakwaas","faltu","bevakuf","chutiya","bsdk","mck",
    ];
    const combined = `${trimmedTitle} ${trimmedBody}`.toLowerCase();
    for (const word of VULGAR_WORDS) {
      // Use word boundary for single words, substring match for phrases
      const pattern = word.includes(" ")
        ? word
        : new RegExp(`\\b${word}\\b`);
      const matched = typeof pattern === "string"
        ? combined.includes(pattern)
        : pattern.test(combined);
      if (matched) {
        return res.status(422).json({
          success: false, blocked: true, layer: 1,
          reason: "blocked_keyword", matched: word,
          message: MODERATION_MESSAGES.blocked_keyword,
        });
      }
    }

    // Spam patterns — always runs locally
    const SPAM_PATTERNS = [
      { re: /(.)\1{3,}/, name: "repeated_characters" },
      { re: /https?:\/\/|www\./i, name: "url_detected" },
      { re: /\b\d{10}\b/, name: "phone_number" },
      { re: /\b(free|click here|buy now|win prize|lottery|discount|offer|limited time)\b/i, name: "spam_phrase" },
    ];
    for (const { re, name } of SPAM_PATTERNS) {
      if (re.test(combined)) {
        return res.status(422).json({
          success: false, blocked: true, layer: 1,
          reason: "spam_pattern", matched: name,
          message: MODERATION_MESSAGES.spam_pattern,
        });
      }
    }

    // Try algo-service for ML toxicity (Layer 2) — optional, fail open
    try {
      const modResult = await checkModeration(trimmedTitle, trimmedBody);
      if (!modResult.passed) {
        return res.status(422).json({
          success: false, blocked: true,
          layer: modResult.layer_blocked,
          reason: modResult.reason,
          matched: modResult.matched_word,
          message: MODERATION_MESSAGES[modResult.reason] || "Your post was blocked by content moderation.",
        });
      }
      postFlagged = modResult.flagged || false;
      toxicityScore = modResult.toxicity_score || 0.0;
      moderationReason = modResult.reason || null;
    } catch {
      console.warn("[Moderation] Algo-service unreachable — local checks passed, post allowed");
    }

    // Layer 3 — Campus Relevance Check (always runs locally)
    const CAMPUS_KEYWORDS = [
      "library","canteen","hostel","wifi","internet","water","electricity","classroom",
      "toilet","bathroom","road","parking","faculty","teacher","exam","result","fees",
      "transport","bus","sports","playground","lab","computer","projector","ac","fan",
      "light","bench","chair","campus","college","university","department","notice",
      "gate","security","smoke","smoking","food","drink","class","student","staff",
      "office","building","floor","room","corridor","staircase","lift","elevator",
      "cafeteria","mess","dormitory","lecture","assignment","attendance","marks",
      "principal","dean","administration","library","book","journal","research",
      "wifi","network","electricity","power","water","pipe","leak","repair","clean",
      "dirty","garbage","waste","noise","disturbance","safety","fire","emergency",
      "medical","health","nurse","doctor","clinic","sports","ground","field","court",
      "equipment","furniture","chair","table","board","projector","screen","ac",
      "heater","fan","window","door","lock","key","parking","vehicle","bike","car",
      "bus","van","driver","guard","watchman","cleaner","sweeper","maintenance",
      "construction","renovation","paint","wall","roof","floor","toilet","washroom",
      "bathroom","sink","tap","shower","electricity","bulb","tube","switch","socket",
      "internet","wifi","broadband","connection","speed","slow","fast","network",
      "fees","tuition","scholarship","stipend","allowance","payment","receipt",
      "certificate","degree","diploma","transcript","marksheet","admit","card",
      "registration","enrollment","admission","application","form","document",
    ];

    const totalLen = combined.length;
    const campusHit = CAMPUS_KEYWORDS.some(kw => combined.includes(kw));

    // Only block as irrelevant if: no campus keyword AND post is short (< 60 chars)
    // Long posts get benefit of doubt — they may describe context before mentioning campus
    if (!campusHit && totalLen < 60) {
      return res.status(422).json({
        success: false, blocked: true, layer: 3,
        reason: "irrelevant", matched: null,
        message: MODERATION_MESSAGES.irrelevant,
      });
    }
    // ─────────────────────────────────────────────────────────────────
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

    const post = await Post.create({
      title: trimmedTitle,
      body: trimmedBody,
      category: categoryId,
      author,
      attachments: attachments || [],
      flagged: postFlagged,
      toxicityScore,
      moderationReason,
    });

    // Create notification and emit to all connected admins
    try {
      const notification = await Notification.create({
        post: post._id,
        postTitle: trimmedTitle,
        authorName: displayName,
        message: `New suggestion submitted by ${displayName}`,
      });
      getIO().to("admin-room").emit("new-notification", notification);
    } catch (err) {
      console.warn("[Notification] Failed to create/emit notification:", err.message);
    }

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
      .populate("author.userId", "name email faculty avatar")
      .lean()
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
      .populate("author.userId", "name email faculty avatar")
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
