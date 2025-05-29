const express = require("express");
const router = express.Router();

// GET /api/notifications
router.get("/", (req, res) => {
  res.json([
    { id: 1, message: "Nouvelle commande reçue", date: new Date(), read: false },
    { id: 2, message: "Stock critique sur une pièce", date: new Date(), read: false },
    { id: 3, message: "Utilisateur inscrit", date: new Date(), read: true },
  ]);
});

module.exports = router;
