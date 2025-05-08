const express = require("express");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/data", auth, (req, res) => {
  res.json({ message: "Voici des données protégées", user: req.user });
});

module.exports = router;