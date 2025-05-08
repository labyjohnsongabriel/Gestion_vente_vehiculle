const express = require("express");
const router = express.Router();
const commandeController = require("../controllers/commandeController");
const detailsController = require("../controllers/detailsCommandeController");
const authMiddleware = require("../middleware/authMiddleware");


// Protéger toutes les routes avec le middleware d'authentification
router.use(authMiddleware);
router.get("/", commandeController.getAllCommandes);
router.get("/:id", commandeController.getCommandeById);
router.post("/", commandeController.createCommande);
router.put("/:id", commandeController.updateCommande);
router.delete("/:id", commandeController.deleteCommande);

// Routes pour les détails de commande
router.get('/:commandeId/details', detailsController.getDetailsByCommandeId);

module.exports = router;
