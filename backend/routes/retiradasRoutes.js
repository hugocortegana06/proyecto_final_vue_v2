const express = require('express');
const router = express.Router();
const retiradasController = require('../controllers/retiradasController');
const { requireLogin } = require('../middleware/authMiddleware');

router.get('/', requireLogin, retiradasController.getRetiradas);
router.post('/', requireLogin, retiradasController.createRetirada);
router.delete('/:id', requireLogin, retiradasController.deleteRetirada);
router.put('/:id', requireLogin, retiradasController.updateRetirada);
router.get('/:id/factura', requireLogin, retiradasController.getFacturaPDF);

module.exports = router;
