/* snipetcode: backend/routes/usuariosRoutes.js */
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
// Opcionalmente, un middleware requireLogin si quieres proteger estas rutas
// const { requireLogin } = require('../middleware/authMiddleware');

// GET /usuarios
router.get('/', usuariosController.getUsuarios);

// POST /usuarios
router.post('/', usuariosController.createUsuario);

// PUT /usuarios/:id
router.put('/:id', usuariosController.updateUsuario);

// DELETE /usuarios/:id
router.delete('/:id', usuariosController.deleteUsuario);

module.exports = router;
