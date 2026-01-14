const express = require('express');
const router = express.Router();
const centroController = require('../controllers/centro.controller');

router.get('/', centroController.getCentres);
router.get('/:id', centroController.getCentreById);
router.post('/', centroController.createCentre);

module.exports = router;