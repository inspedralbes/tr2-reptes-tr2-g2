const express = require('express');

const router = express.Router();

const alumneRoutes = require('./alumne.routes');
const tallerRoutes = require('./taller.routes');

router.use('/alumnes', alumneRoutes);
router.use('/talleres', tallerRoutes);

module.exports = router;
