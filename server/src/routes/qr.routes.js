const router = require("express").Router();
const { getQRUrl } = require("../controllers/qr.controller");

router.get("/url", getQRUrl);

module.exports = router;
