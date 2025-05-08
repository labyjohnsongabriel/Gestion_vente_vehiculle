const express = require("express");
const pieceController = require("../controllers/pieceController");
const authMiddleware = require("../middleware/authMiddleware");
console.log("pieceController :", pieceController); // Vérifiez que les fonctions sont bien importées
console.log("authMiddleware :", authMiddleware); // Vérifiez que le middleware est bien importé

const router = express.Router();console.log("pieceController :", pieceController);

router.use(authMiddleware);
// ✅ Protéger toutes les routes avec le middleware d'authentification
router.get("/", pieceController.getAllPieces);
router.get("/:id", pieceController.getPiece);
router.post("/", pieceController.createPiece);// ✅ Route pour récupérer toutes les pièces
router.put("/:id", pieceController.updatePiece);
router.delete("/:id", pieceController.deletePiece);
// ✅ Route pour récupérer une pièce par ID
module.exports = router;router.delete("/:id", pieceController.deletePiece);

module.exports = router;