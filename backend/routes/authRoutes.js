/* snipetcode: backend/routes/authRoutes.js */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/isLoggedIn', authController.isLoggedIn);

module.exports = router;
