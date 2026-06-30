let _io = null;

const init = (httpServer, corsOrigins) => {
  const { Server } = require("socket.io");
  _io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true,
    },
  });
  return _io;
};

const getIO = () => {
  if (!_io) throw new Error("Socket.io not initialized");
  return _io;
};

module.exports = { init, getIO };
