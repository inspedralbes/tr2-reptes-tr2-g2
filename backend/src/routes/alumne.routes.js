const express = require('express');
const router = express.Router();
const alumneController = require('../controllers/alumne.controller');

router.get('/', alumneController.getAllAlumnes);

module.exports = router;
