const express = require('express');

const router = express.Router();

const alumneRoutes = require('./alumne.routes');
const tallerRoutes = require('./taller.routes');
const authRoutes = require('./auth.routes'); 
const profesorRoutes = require('./profesor.routes');

router.use('/alumnes', alumneRoutes);   // Ahora será /api/alumnes
router.use('/talleres', tallerRoutes);  // Ahora será /api/talleres
router.use('/auth', authRoutes);        // Ahora será /api/auth
router.use('/profesores', profesorRoutes); // Ahora será /api/profesores

module.exports = router;