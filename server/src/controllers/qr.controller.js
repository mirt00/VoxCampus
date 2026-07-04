const getQRUrl = (req, res) => {
  const base = (process.env.CLIENT_URL || "http://localhost:5173")
    .trim()
    .replace(/\n/g, "")
    .replace(/\r/g, "")
    .replace(/\/$/, "");
  res.json({ url: `${base}/` });
};

module.exports = { getQRUrl };
