// authRouter.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Route pour l'inscription (pas besoin d'être authentifié)
router.post("/register", authController.register);

// Route pour la connexion (pas besoin d'être authentifié)
router.post("/login", authController.login);

// Routes protégées (nécessitent un token valide)
router.get("/profile", authMiddleware, authController.getProfile);
router.put("/profile", authMiddleware, authController.updateProfile);

// Routes de réinitialisation de mot de passe
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
