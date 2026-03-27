const getQRUrl = (req, res) => {
  const url = `${process.env.CLIENT_URL}/submit`.trim().replace(/\n/g, "").replace(/\r/g, "");
  res.json({ url });
};

module.exports = { getQRUrl };
