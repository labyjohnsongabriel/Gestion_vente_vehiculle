const express = require('express');
const router = express.Router();
const controller = require('../controllers/detailsCommandeController');

router.get('/:commandeId', controller.getDetailsByCommandeId);
router.post('/', controller.addDetail);
router.put('/:id', controller.updateDetail);
router.delete('/:id', controller.deleteDetail);

module.exports = router;
