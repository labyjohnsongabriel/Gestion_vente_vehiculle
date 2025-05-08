const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

router.get("/test", authenticateToken, (req, res) => {
  res.json({ message: "Middleware fonctionne correctement", user: req.user });
});

module.exports = router;
