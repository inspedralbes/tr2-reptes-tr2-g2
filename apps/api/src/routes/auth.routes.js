const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Ruta para el login de profesores
router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;
