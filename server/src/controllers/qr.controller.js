const getQRUrl = (req, res) => {
  const base = (process.env.CLIENT_URL || "http://localhost:5173")
    .trim()
    .replace(/\n/g, "")
    .replace(/\r/g, "")
    .replace(/\/$/, ""); // remove trailing slash
  const url = `${base}/submit`;
  res.json({ url });
};

module.exports = { getQRUrl };
