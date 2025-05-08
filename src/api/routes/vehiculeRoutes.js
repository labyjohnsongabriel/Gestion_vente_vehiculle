const express = require('express');
const router = express.Router();
const Controller = require('../controllers/vehiculeController');
const authMiddleware = require("../middleware/authMiddleware");

// Protéger toutes les routes avec le middleware d'authentification
router.use(authMiddleware);
router.get('/', Controller.getAllVehicules);
router.get('/:id', Controller.getVehiculeById);
router.post('/', Controller.createVehicule);
router.put('/:id', Controller.updateVehicule);
router.delete('/:id',Controller.deleteVehicule);

module.exports = router;  