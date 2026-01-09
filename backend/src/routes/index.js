const express = require('express');
const router = express.Router();

const tallerRoutes = require('./taller.routes');
const authRoutes = require('./auth.routes'); // Importar authRoutes

router.use('/api', tallerRoutes);
router.use('/api', authRoutes); // Usar authRoutes

module.exports = router;
