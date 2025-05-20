const express = require("express");
const router = express.Router();
const commandeController = require("../controllers/commandeController");
const detailsController = require("../controllers/detailsCommandeController");




router.get("/", commandeController.getAllCommandes);
router.get("/:id", commandeController.getCommandeById);
router.post("/", commandeController.createCommande);
router.put("/:id", commandeController.updateCommande);
router.delete("/:id", commandeController.deleteCommande);

// Routes pour les détails de commande
router.get('/:commandeId/details', detailsController.getDetailsByCommandeId);

module.exports = router;
