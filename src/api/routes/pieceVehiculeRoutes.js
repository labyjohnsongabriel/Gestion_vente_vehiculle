const express = require('express');
const router = express.Router();
const controller = require("../controllers/pieceVehiculeController");

router.get('/', controller.getAllAssociations);
router.get('/:vehicule/:vehiculeId', controller.getPiecesByVehicule);
router.post('/', controller.createAssociation);
router.put('/:id', controller.updateAssociation);
router.delete('/:id', controller.deleteAssociation);

module.exports = router;