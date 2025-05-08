const express = require("express");
const clientController = require("../controllers/clientController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Route pour récupérer le nombre de clients
router.get("/count", clientController.getClientCount);

// ✅ Routes publiques
router.get("/", clientController.getAllClients);
router.get("/:id", clientController.getClientById);

// ✅ Routes protégées
router.post("/", authMiddleware, clientController.createClient);
router.post("/", clientController.createClient);

// ✅ Route pour mettre à jour un client
router.put("/:id", clientController.updateClient);

// ✅ Route pour supprimer un client
router.delete("/:id", clientController.deleteClient);

module.exports = router;
