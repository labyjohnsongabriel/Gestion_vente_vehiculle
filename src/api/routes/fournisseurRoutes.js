const express = require("express");
const router = express.Router();
const fournisseurController = require("../controllers/fournisseurController");

// ✅ Route pour récupérer tous les fournisseurs
router.get("/", fournisseurController.getAllFournisseurs);

// ✅ Route pour récupérer un fournisseur par ID
router.get("/:id", fournisseurController.getFournisseurById);

// ✅ Route pour créer un nouveau fournisseur
router.post("/", fournisseurController.createFournisseur);

// ✅ Route pour mettre à jour un fournisseur
router.put("/:id", fournisseurController.updateFournisseur);

// ✅ Route pour supprimer un fournisseur
router.delete("/:id", fournisseurController.deleteFournisseur);

module.exports = router;
