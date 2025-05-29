const express = require("express");
const router = express.Router();
const StockController = require("../controllers/stockController");

// Mock stock data (replace with DB query as needed)
router.get("/", StockController.getAllStocks);
router.patch("/:id/adjust", StockController.adjustStock);
router.get("/:id", StockController.getStockByPieceId);
router.get("/:id/history", StockController.getStockHistory);
router.get("/:id/trends", StockController.getStockTrends);
router.get("/stats", StockController.getStockStats);
router.post("/", StockController.createStock);
router.put("/:id", StockController.updateStock);
router.delete("/:id", StockController.deleteStock);
router.get("/count", StockController.getStockStats);

module.exports = router;
