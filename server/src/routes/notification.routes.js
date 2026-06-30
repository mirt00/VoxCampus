const router = require("express").Router();
const { getNotifications, getUnreadCount, markRead, markAllRead } = require("../controllers/notification.controller");
const verifyJWT = require("../middleware/auth.middleware");

// All logged-in users can access their own notifications
router.use(verifyJWT);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);

module.exports = router;
