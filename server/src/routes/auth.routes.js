const router = require("express").Router();
const { register, login, logout, forgotPassword, resetPassword, changePassword, getMe, updateAvatar, updateProfile } = require("../controllers/auth.controller");
const verifyJWT = require("../middleware/auth.middleware");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema, forgotSchema, resetSchema, changePasswordSchema } = require("../validators/auth.validator");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/forgot-password", validate(forgotSchema), forgotPassword);
router.post("/reset-password/:token", validate(resetSchema), resetPassword);
router.post("/change-password", verifyJWT, validate(changePasswordSchema), changePassword);
router.get("/me", verifyJWT, getMe);
router.patch("/avatar", verifyJWT, updateAvatar);
router.patch("/profile", verifyJWT, updateProfile);

module.exports = router;
