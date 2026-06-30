const Notification = require("../models/Notification.model");

const getNotifications = async (req, res, next) => {
  try {
    const isAdmin = ["admin", "superadmin"].includes(req.user.role);
    const filter = isAdmin
      ? { recipientType: "admin" }
      : { recipientType: "user", recipient: req.user.id };

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(notifications);
  } catch (err) { next(err); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const isAdmin = ["admin", "superadmin"].includes(req.user.role);
    const filter = isAdmin
      ? { recipientType: "admin", read: false }
      : { recipientType: "user", recipient: req.user.id, read: false };

    const count = await Notification.countDocuments(filter);
    res.json({ count });
  } catch (err) { next(err); }
};

const markRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

const markAllRead = async (req, res, next) => {
  try {
    const isAdmin = ["admin", "superadmin"].includes(req.user.role);
    const filter = isAdmin
      ? { recipientType: "admin", read: false }
      : { recipientType: "user", recipient: req.user.id, read: false };

    await Notification.updateMany(filter, { read: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

module.exports = { getNotifications, getUnreadCount, markRead, markAllRead };
