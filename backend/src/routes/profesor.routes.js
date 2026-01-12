const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesor.controller');
const validateId = require('../middlewares/validationId');

// --- RUTAS SIN ID ---
router.get('/profesores', profesorController.getAllProfesores);
router.post('/profesores', profesorController.createProfesor);

// --- RUTAS CON ID ---
router.get('/profesores/:id', validateId, profesorController.getProfesorById);
router.put('/profesores/:id', validateId, profesorController.updateProfesor);
router.delete('/profesores/:id', validateId, profesorController.deleteProfesor);

module.exports = router;
