const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Ruta para el login de profesores
router.post('/auth/login', authController.login);

module.exports = router;
