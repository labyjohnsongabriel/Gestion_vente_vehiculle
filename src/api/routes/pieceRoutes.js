const express = require("express");
const pieceController = require("../controllers/pieceController");
const uploadController = require("../controllers/uploadController");

const router = express.Router();

router.post("/api/upload", uploadController.uploadImage);
// ✅ Route pour récupérer toutes les pièces
router.get("/", pieceController.getAllPieces);

// ✅ Route pour récupérer une pièce par ID
router.get("/:id", pieceController.getPiece);

// ✅ Route pour créer une nouvelle pièce
router.post("/", pieceController.createPiece);

// ✅ Route pour mettre à jour une pièce
router.put("/:id", pieceController.updatePiece);

// ✅ Route pour supprimer une pièce
router.delete("/:id", pieceController.deletePiece);

module.exports = router;
