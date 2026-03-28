const router = require("express").Router();
const { getPosts, updateStatus, assignAdmin, saveNote, saveFeedback, getEscalationLog, getAdmins, createAdmin, deactivateAdmin } = require("../controllers/admin.controller");
const verifyJWT = require("../middleware/auth.middleware");
const roleGuard = require("../middleware/role.middleware");

router.use(verifyJWT, roleGuard(["admin", "superadmin"]));

router.get("/posts", getPosts);
router.patch("/posts/:id/status", updateStatus);
router.patch("/posts/:id/assign", assignAdmin);
router.patch("/posts/:id/note", saveNote);
router.patch("/posts/:id/feedback", saveFeedback);
router.get("/posts/:id/escalation-log", getEscalationLog);

router.get("/users", roleGuard(["superadmin"]), getAdmins);
router.post("/users", roleGuard(["superadmin"]), createAdmin);
router.patch("/users/:id/deactivate", roleGuard(["superadmin"]), deactivateAdmin);

module.exports = router;
