const Post = require("../models/Post.model");
const User = require("../models/User.model");
const EscalationLog = require("../models/EscalationLog.model");
const bcrypt = require("bcryptjs");

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

module.exports = { getPosts, updateStatus, assignAdmin, saveNote, getEscalationLog, getAdmins, createAdmin, deactivateAdmin };
