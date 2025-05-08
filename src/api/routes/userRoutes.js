// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../config/multer");

router.use(authMiddleware);

// ✅ Route pour récupérer le profil
router.get("/profile", authMiddleware, userController.getProfile);

// ✅ Route pour mettre à jour le profil
router.put("/profile", authMiddleware, userController.updateProfile);



module.exports = router;
