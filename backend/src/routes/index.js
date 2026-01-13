const express = require('express');

const router = express.Router();

const alumneRoutes = require('./alumne.routes');
const tallerRoutes = require('./taller.routes');
const authRoutes = require('./auth.routes'); // Importar authRoutes
const profesorRoutes = require('./profesor.routes');

router.use('/api', tallerRoutes);
router.use('/api', authRoutes); // Usar authRoutes
router.use('/api', profesorRoutes);

module.exports = router;
