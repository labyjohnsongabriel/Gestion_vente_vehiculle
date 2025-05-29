const express = require("express");
const router = express.Router();
const commandeController = require("../controllers/commandeController");
const detailsController = require("../controllers/detailsCommandeController");
const db = require("../config/db");


router.get("/", commandeController.getAllCommandes);
router.get("/:id", commandeController.getCommandeById);
router.post("/", commandeController.createCommande);
router.put("/:id", commandeController.updateCommande);
router.delete("/:id", commandeController.deleteCommande);

// Routes pour les détails de commande
router.get('/:commandeId/details', detailsController.getDetailsByCommandeId);

// Update commande status
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const [result] = await db.query(
      "UPDATE commandes SET status = ? WHERE id = ?",
      [status, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    res.json({ message: "Statut mis à jour" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
