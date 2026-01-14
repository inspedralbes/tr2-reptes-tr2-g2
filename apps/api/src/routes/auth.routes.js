const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /api/auth/register - Registrar nuevo usuario (generalmente Admin o script semilla)
router.post('/register', authController.register);

// POST /api/auth/login - Iniciar sesión
router.post('/login', authController.login);

// GET /api/auth/me - Obtener datos del usuario actual (requiere token)
// router.get('/me', authMiddleware, authController.getMe);

module.exports = router;