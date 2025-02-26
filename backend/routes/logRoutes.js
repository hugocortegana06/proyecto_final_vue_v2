// routes/logRoutes.js
const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');

// Define la ruta GET para obtener los logs
// Al montar esta ruta con el prefijo /api, la URL completa será http://localhost:3000/api/logs
router.get('/logs', logsController.getLogs);

module.exports = router;
