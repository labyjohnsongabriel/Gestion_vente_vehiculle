const express = require("express");
const clientController = require("../controllers/clientController");
const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware"); // Middleware pour gérer les uploads

const router = express.Router();

// ✅ Route pour récupérer le nombre de clients
router.get("/count", clientController.getClientCount);

// ✅ Routes publiques
router.get("/", clientController.getAllClients);
router.get("/:id", clientController.getClientById);

// ✅ Routes protégées
router.post("/", authMiddleware, clientController.createClient);
router.put("/:id", authMiddleware, clientController.updateClient);
router.delete("/:id", authMiddleware, clientController.deleteClient);

const upload = require("../middleware/uploadMiddleware");
router.post("/clients", upload.single("image"), clientController.createClient);
router.put(
  "/clients/:id",
  upload.single("image"),
  clientController.updateClient
);
module.exports = router;
