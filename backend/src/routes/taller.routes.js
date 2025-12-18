const express = require('express');
const router = express.Router();
const tallerController = require('../controllers/taller.controller');
const validateId = require('../middlewares/validationId');

// --- RUTAS SIN ID ---
router.get('/talleres', tallerController.getAllTalleres);
router.post('/talleres', tallerController.createTaller);

// --- RUTAS CON ID ---
router.get('/talleres/:id', validateId, tallerController.getTallerById); 

router.put('/talleres/:id', validateId, tallerController.updateTaller);
router.delete('/talleres/:id', validateId, tallerController.deleteTaller);

module.exports = router;