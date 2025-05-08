// authRouter.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../server/middleware/authMiddleware"); // Importation du middleware

// Route pour l'inscription
router.post("/register", authController.register);

// Route pour la connexion
router.post("/login", authController.login);

// Route pour récupérer le profil de l'utilisateur (protégée)
router.get("/profile", authMiddleware, authController.getProfile);

// Route pour mettre à jour le profil de l'utilisateur (protégée)
router.put("/profile", authMiddleware, authController.updateProfile);


router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
