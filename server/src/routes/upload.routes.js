const router = require("express").Router();
const upload = require("../middleware/upload");
const verifyJWT = require("../middleware/auth.middleware");
const { uploadToCloudinary } = require("../services/upload.service");
const User = require("../models/User.model");

// Upload avatar
router.post("/avatar", verifyJWT, upload.single("avatar"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });
    const url = await uploadToCloudinary(req.file.buffer, "voxcampus/avatars");
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: url },
      { new: true }
    ).select("-passwordHash -resetToken -resetTokenExpiry");
    res.json({ url, user });
  } catch (err) { next(err); }
});

// Upload post image
router.post("/post-image", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });
    const url = await uploadToCloudinary(req.file.buffer, "voxcampus/posts");
    res.json({ url });
  } catch (err) { next(err); }
});

module.exports = router;
