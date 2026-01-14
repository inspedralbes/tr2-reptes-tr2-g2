const express = require('express');
const router = express.Router();
// Tendremos que crear este controlador en el siguiente paso
const peticioController = require('../controllers/peticio.controller');

// GET /api/peticions - Admin ve todas, Coordinador ve las suyas
router.get('/', peticioController.getPeticions);

// POST /api/peticions - Coordinador crea una solicitud
router.post('/', peticioController.createPeticio);

// PATCH /api/peticions/:id/status - Admin aprueba/rechaza
router.patch('/:id/status', peticioController.updatePeticioStatus);

module.exports = router;