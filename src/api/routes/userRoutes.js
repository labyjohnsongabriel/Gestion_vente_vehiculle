const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const multer = require("multer");
const path = require("path");
const requireAuth = require("../middleware/requireAuth");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

// Configuration de multer pour l'upload d'avatar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/avatars/"); // Assurez-vous que ce dossier existe
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Seules les images sont autorisées!"), false);
    }
  },
});

// Routes
router.post("/register", authController.register);
router.get("/", userController.getAllUsers);
router.get("/profile", userController.getProfile);
router.put(
  "/profile",
  requireAuth, // Ajoutez ce middleware ici
  upload.single("avatar"), // Pour les mises à jour générales + avatar
  userController.updateProfile
);
router.patch(
  "/profile/avatar",
  requireAuth,
  upload.single("avatar"),
  userController.updateAvatar
);

// GET /api/users/me
router.get("/me", auth, async (req, res) => {
  try {
    // Adaptez selon votre modèle User
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
