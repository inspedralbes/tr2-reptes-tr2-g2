const express = require('express');
const router = express.Router();
const tallerController = require('../controllers/taller.controller');

router.get('/talleres', tallerController.getAllTalleres);

module.exports = router;
