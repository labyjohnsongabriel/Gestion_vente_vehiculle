const express = require("express");
const router = express.Router();
const commandeController = require("../controllers/commandeController");

router.get("/", commandeController.getAllCommandes);
router.get("/:id", commandeController.getCommandeById);
router.post("/", commandeController.createCommande);
router.put("/:id", commandeController.updateCommande);
router.delete("/:id", commandeController.deleteCommande);

module.exports = router;
