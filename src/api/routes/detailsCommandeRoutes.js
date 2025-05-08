const express = require("express");
const router = express.Router();
const controller = require("../controllers/detailsCommandeController");
const authMiddleware = require("../middleware/authMiddleware");

// Ajout du middleware d'authentification sur toutes les routes
router.use(authMiddleware);

// Routes avec validation des paramètres
router.get("/commandes/:commandeId/details", controller.getDetailsByCommandeId);
router.post("/commandes/:commandeId/details", controller.addDetail);
router.put("/details/:id", controller.updateDetail);
router.delete("/details/:id", controller.deleteDetail);

module.exports = router;
