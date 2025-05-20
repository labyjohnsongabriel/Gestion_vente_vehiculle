// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

const upload = require("../config/multer");

// routes/userRoutes.js

router.post("/register", userController.registerUser);

router.get("/",userController.getAllUsers);

// ✅ Route pour récupérer le profil
router.get("/profile", userController.getProfile);

// ✅ Route pour mettre à jour le profil
router.put("/profile", userController.updateProfile);



module.exports = router
