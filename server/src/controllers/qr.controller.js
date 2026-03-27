const getQRUrl = (req, res) => {
  const url = `${process.env.CLIENT_URL}/submit`;
  res.json({ url });
};

module.exports = { getQRUrl };
