const crypto = require("crypto");

const hashIP = (ip) => {
  return crypto.createHash("sha256").update(ip).digest("hex");
};

module.exports = hashIP;
