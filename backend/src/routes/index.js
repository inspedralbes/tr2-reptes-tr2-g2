const express = require('express');

const router = express.Router();

const alumneRoutes = require('./alumne.routes');
const tallerRoutes = require('./taller.routes');

router.use('/alumnes', alumneRoutes);
router.use('/', tallerRoutes);

module.exports = router;
