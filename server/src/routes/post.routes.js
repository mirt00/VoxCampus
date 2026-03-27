const router = require("express").Router();
const { createPost, getPosts, getPostById } = require("../controllers/post.controller");
const verifyJWT = require("../middleware/auth.middleware");
const validate = require("../middleware/validate");
const { postLimiter } = require("../middleware/rateLimiter");
const { createPostSchema } = require("../validators/post.validator");

// Optional auth — attaches req.user if cookie present, doesn't block if not
const optionalAuth = (req, res, next) => {
  const jwt = require("jsonwebtoken");
  const token = req.cookies?.token;
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch {}
  }
  next();
};

router.get("/", getPosts);
router.get("/:id", getPostById);
router.post("/", postLimiter, optionalAuth, validate(createPostSchema), createPost);

module.exports = router;
