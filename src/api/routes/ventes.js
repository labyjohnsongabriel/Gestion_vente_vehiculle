const express = require("express");
const router = express.Router();
const venteController = require("../controllers/venteController");

router.get("/", venteController.getAll);
router.get("/:id", venteController.getById);
router.post("/", venteController.create);
router.delete("/:id", venteController.delete);
router.get("/count/all", venteController.count);
router.put("/:id", venteController.update);

module.exports = router;

{/**const express = require("express");
const router = express.Router();
const venteController = require("../controllers/venteController");

// Routes de base
router.get("/", venteController.getAll);
router.get("/:id", venteController.getById);
router.post("/", venteController.create);
router.delete("/:id", venteController.delete);
router.put("/:id", venteController.update);

// Routes de statistiques
router.get("/count/all", venteController.count);
router.get("/count/month", venteController.countThisMonth);
router.get("/count/last-month", venteController.countLastMonth);
router.get("/chiffre-affaires", venteController.chiffreAffaires);
router.get("/stats/mensuelles", venteController.statsMensuelles);
router.get("/stats/jour", venteController.statsParJour);
router.get("/top/pieces", venteController.topPieces);
router.get("/top/clients", venteController.topClients);

module.exports = router;
 */}