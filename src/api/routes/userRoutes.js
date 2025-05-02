// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../config/multer");

// ✅ Route pour récupérer tous les utilisateurs
router.get("/", authMiddleware, userController.getAllUsers);

// ✅ Route pour récupérer le profil
router.get("/profile", authMiddleware, userController.getProfile);

// ✅ Route pour mettre à jour le profil
router.put("/profile", authMiddleware, userController.updateProfile);

// ✅ Route pour mettre à jour l'avatar
router.put(
  "/profile/avatar",
  authMiddleware,
  upload.single("avatar"),
  userController.updateAvatar
);

module.exports = router;
