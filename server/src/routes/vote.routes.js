const router = require("express").Router();
const { upvotePost } = require("../controllers/vote.controller");

// Optional auth
const optionalAuth = (req, res, next) => {
  const jwt = require("jsonwebtoken");
  const token = req.cookies?.token;
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch {}
  }
  next();
};

router.post("/:postId", optionalAuth, upvotePost);

module.exports = router;
