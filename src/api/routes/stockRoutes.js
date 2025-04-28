const express = require("express");
const router = express.Router();
const StockController = require("../controllers/stockController");

router.get('/', StockController.getAllStocks);
router.get('/:id', StockController.getStockByPieceId);
router.post('/', StockController.createStock);
router.put('/:id', StockController.updateStock);
router.delete('/:id',StockController.deleteStock);

module.exports = router;