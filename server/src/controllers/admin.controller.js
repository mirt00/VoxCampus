const Post = require("../models/Post.model");
const User = require("../models/User.model");
const Vote = require("../models/Vote.model");
const EscalationLog = require("../models/EscalationLog.model");
const bcrypt = require("bcryptjs");
const { getEngagement } = require("../services/python.service");

const getPosts = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const posts = await Post.find(filter)
      .populate("category", "name slug")
      .populate("assignedAdmin", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Post.countDocuments(filter);
    res.json({ posts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const post = await Post.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) { next(err); }
};

const assignAdmin = async (req, res, next) => {
  try {
    const { adminId } = req.body;
    const post = await Post.findByIdAndUpdate(req.params.id, { assignedAdmin: adminId }, { new: true });
    res.json(post);
  } catch (err) { next(err); }
};

const saveNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    const post = await Post.findByIdAndUpdate(req.params.id, { adminNote: note }, { new: true });
    res.json(post);
  } catch (err) { next(err); }
};

const saveFeedback = async (req, res, next) => {
  try {
    const { feedback } = req.body;
    const post = await Post.findByIdAndUpdate(req.params.id, { adminFeedback: feedback }, { new: true });
    res.json(post);
  } catch (err) { next(err); }
};

const getEscalationLog = async (req, res, next) => {
  try {
    const logs = await EscalationLog.find({ postId: req.params.id }).sort({ triggeredAt: -1 });
    res.json(logs);
  } catch (err) { next(err); }
};

const getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: { $in: ["admin", "superadmin"] } }).select("-passwordHash -resetToken");
    res.json(admins);
  } catch (err) { next(err); }
};

const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role: role || "admin" });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) { next(err); }
};

const deactivateAdmin = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Admin deactivated" });
  } catch (err) { next(err); }
};

const getEngagementData = async (req, res, next) => {
  try {
    const users = await User.find({ role: "user", isActive: true })
      .select("_id name faculty createdAt")
      .lean();

    const postCounts = await Post.aggregate([
      { $match: { "author.userId": { $ne: null } } },
      { $group: { _id: "$author.userId", count: { $sum: 1 } } },
    ]);
    const postMap = {};
    for (const p of postCounts) postMap[String(p._id)] = p.count;

    const voteCounts = await Vote.aggregate([
      { $match: { userId: { $ne: null } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);
    const voteMap = {};
    for (const v of voteCounts) voteMap[String(v._id)] = v.count;

    const userActivityList = users
      .filter((u) => postMap[String(u._id)] || voteMap[String(u._id)])
      .map((u) => ({
        userId: String(u._id),
        name: u.name,
        faculty: u.faculty || "Unknown",
        postCount: postMap[String(u._id)] || 0,
        voteCount: voteMap[String(u._id)] || 0,
        daysSinceFirstActivity: Math.max(
          1,
          (Date.now() - new Date(u.createdAt).getTime()) / 86400000
        ),
      }));

    let result;
    try {
      result = await getEngagement(userActivityList);
    } catch {
      result = null;
    }

    res.json({ engagement: result, raw: userActivityList });
  } catch (err) { next(err); }
};

module.exports = { getPosts, updateStatus, assignAdmin, saveNote, saveFeedback, getEscalationLog, getAdmins, createAdmin, deactivateAdmin, getEngagementData };
