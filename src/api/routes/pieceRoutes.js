const express = require('express');
const router = express.Router();
const pieceController = require('../controllers/pieceController');

router.get('/', pieceController.getAllPieces);
router.get('/:id', pieceController.getPieceById);
router.post('/', pieceController.createPiece);
router.put('/:id', pieceController.updatePiece);
router.delete('/:id', pieceController.deletePiece);

module.exports = router;
