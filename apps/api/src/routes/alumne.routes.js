const express = require('express');
const router = express.Router();
const alumneController = require('../controllers/alumne.controller');

router.get('/', alumneController.getAlumnes);
router.post('/', alumneController.createAlumne);

module.exports = router;