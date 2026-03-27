const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User.model");
const generateToken = require("../utils/generateToken");
const { sendResetEmail } = require("../services/mail.service");

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, faculty, department, studentId, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, faculty, department, studentId, phone });

    const token = generateToken({ id: user._id, role: user.role });
    res.cookie("token", token, COOKIE_OPTS);
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.isActive) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken({ id: user._id, role: user.role });
    res.cookie("token", token, COOKIE_OPTS);
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "If that email exists, a reset link was sent." });

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
    await sendResetEmail(user.email, resetUrl);
    res.json({ message: "If that email exists, a reset link was sent." });
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({ resetToken: hashedToken, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.passwordHash = await bcrypt.hash(req.body.password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) return res.status(400).json({ message: "Old password is incorrect" });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash -resetToken -resetTokenExpiry");
    res.json(user);
  } catch (err) { next(err); }
};

const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true }
    ).select("-passwordHash -resetToken -resetTokenExpiry");
    res.json(user);
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, faculty, department, studentId, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, faculty, department, studentId, phone },
      { new: true }
    ).select("-passwordHash -resetToken -resetTokenExpiry");
    res.json(user);
  } catch (err) { next(err); }
};

module.exports = { register, login, logout, forgotPassword, resetPassword, changePassword, getMe, updateAvatar, updateProfile };
