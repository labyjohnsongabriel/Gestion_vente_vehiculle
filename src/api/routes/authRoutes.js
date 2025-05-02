// authRouter.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ✅ Route pour l'inscription
router.post("/register", authController.register);

// ✅ Route pour la connexion
router.post("/login", authController.login);

// ✅ Route pour demander une réinitialisation de mot de passe
router.post("/forgot-password", authController.forgotPassword);

// ✅ Route pour réinitialiser le mot de passe
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
