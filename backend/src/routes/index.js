const express = require('express');
const router = express.Router();

const tallerRoutes = require('./taller.routes');
// Import other route files here in the future

router.use('/api', tallerRoutes);
// Use other routes here

module.exports = router;
