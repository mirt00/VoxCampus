const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("path");
const errorHandler = require("./src/middleware/errorHandler");

const authRoutes = require("./src/routes/auth.routes");
const postRoutes = require("./src/routes/post.routes");
const voteRoutes = require("./src/routes/vote.routes");
const adminRoutes = require("./src/routes/admin.routes");
const qrRoutes = require("./src/routes/qr.routes");
const categoryRoutes = require("./src/routes/category.routes");
const uploadRoutes = require("./src/routes/upload.routes");

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"];
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push(/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/);
}
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/health", (_, res) => res.json({ status: "ok" }));

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  const clientBuild = path.join(__dirname, "../client/dist");
  app.use(express.static(clientBuild));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuild, "index.html"));
  });
}

app.use(errorHandler);

module.exports = app;
