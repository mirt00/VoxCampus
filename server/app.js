const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const errorHandler = require("./src/middleware/errorHandler");

const authRoutes = require("./src/routes/auth.routes");
const postRoutes = require("./src/routes/post.routes");
const voteRoutes = require("./src/routes/vote.routes");
const adminRoutes = require("./src/routes/admin.routes");
const qrRoutes = require("./src/routes/qr.routes");
const categoryRoutes = require("./src/routes/category.routes");
const uploadRoutes = require("./src/routes/upload.routes");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.use(errorHandler);

module.exports = app;
