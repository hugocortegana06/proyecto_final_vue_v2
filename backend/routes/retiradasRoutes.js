const express = require('express');
const router = express.Router();
const retiradasController = require('../controllers/retiradasController');
const { requireLogin } = require('../middleware/authMiddleware');

router.get('/', requireLogin, retiradasController.getRetiradas);
router.post('/', requireLogin, retiradasController.createRetirada);
router.delete('/:idvehiculos', retiradasController.deleteRetirada);
router.get('/:id/pdf', requireLogin, retiradasController.getRetiradaPDF);

module.exports = router;
