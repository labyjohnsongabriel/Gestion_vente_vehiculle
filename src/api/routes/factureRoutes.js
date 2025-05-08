const express = require("express");
const router = express.Router();
const factureController = require("../controllers/factureController");

router.get("/", factureController.getAllFactures);      // GET /api/factures
router.get("/:id", factureController.getFactureById);   // GET /api/factures/:id
router.post("/", factureController.createFacture);      // POST /api/factures
router.delete("/:id", factureController.deleteFacture); // DELETE /api/factures/:id

module.exports = router;

