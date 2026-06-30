require("dotenv").config();
const http = require("http");
const jwt = require("jsonwebtoken");
const app = require("./app");
const connectDB = require("./src/config/db");
const startEscalationJob = require("./src/jobs/escalation.job");
const { init: initSocket } = require("./src/utils/socket");

const PORT = process.env.PORT || 5000;

const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"].filter(Boolean);

connectDB().then(() => {
  const httpServer = http.createServer(app);
  const io = initSocket(httpServer, allowedOrigins);

  // All logged-in users can connect (admins + regular users)
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || "";
      const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
      if (!match) return next(new Error("Not authenticated"));
      const decoded = jwt.verify(match[1], process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const { role, id, name } = socket.user;
    if (["admin", "superadmin"].includes(role)) {
      socket.join("admin-room");
      console.log(`[Socket] Admin connected: ${name}`);
    } else {
      socket.join(`user-${id}`);
      console.log(`[Socket] User connected: ${name}`);
    }
    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${name}`);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startEscalationJob();
  });
});
