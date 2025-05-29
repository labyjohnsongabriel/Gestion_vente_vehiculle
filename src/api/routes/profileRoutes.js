const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updateAvatar,
} = require("../controllers/profileController");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Multer config for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads/avatars"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.get("/", auth, getProfile);
router.put("/", auth, updateProfile);

// Avatar upload route
router.patch("/avatar", auth, upload.single("avatar"), updateAvatar);

module.exports = router;
