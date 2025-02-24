/* snipetcode: backend/routes/vehiculosRoutes.js */
const express = require('express');
const router = express.Router();
const vehiculosController = require('../controllers/vehiculosController');
const { requireLogin } = require('../middleware/authMiddleware');

router.get('/', requireLogin, vehiculosController.getVehiculos);
router.post('/', requireLogin, vehiculosController.createVehiculo);
router.put('/:id', requireLogin, vehiculosController.updateVehiculo);
router.delete('/:id', requireLogin, vehiculosController.deleteVehiculo);

module.exports = router;
