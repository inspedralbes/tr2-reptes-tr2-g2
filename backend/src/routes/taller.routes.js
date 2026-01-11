const express = require('express');
const router = express.Router();
const tallerController = require('../controllers/taller.controller');
const validateId = require('../middlewares/validationId');

// --- RUTAS SIN ID ---
router.get('/', tallerController.getAllTalleres);
router.post('/', tallerController.createTaller);

// --- RUTAS CON ID ---
router.get('/:id', validateId, tallerController.getTallerById); 
router.put('/:id', validateId, tallerController.updateTaller);
router.delete('/:id', validateId, tallerController.deleteTaller);

module.exports = router;
