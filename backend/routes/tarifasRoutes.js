// backend/routes/tarifasRoutes.js
const express = require('express');
const router = express.Router();
const tarifasController = require('../controllers/tarifasController');

router.get('/', tarifasController.getTarifas);

module.exports = router;
