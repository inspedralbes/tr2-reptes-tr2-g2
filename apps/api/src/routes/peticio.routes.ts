import express from 'express';
const router = express.Router();
// Tendremos que crear este controlador en el siguiente paso
import * as peticioController from '../controllers/peticio.controller';
import { authenticateToken, isAdmin, isCoordinator } from '../middlewares/authMiddleware';
import { validateData } from '../middlewares/validateMiddleware';
import { createPeticioSchema, updatePeticioStatusSchema, updatePeticioSchema } from '../schemas/peticio.schema';

// GET /api/peticions - Admin ve todas, Coordinador ve las suyas
router.get('/', authenticateToken, peticioController.getPeticions);

// POST /api/peticions - Coordinador crea una solicitud
router.post('/', authenticateToken, isCoordinator, validateData(createPeticioSchema), peticioController.createPeticio);

// PUT /api/peticions/:id - Coordinador edita su solicitud (si está pendiente)
router.put('/:id', authenticateToken, isCoordinator, validateData(updatePeticioSchema), peticioController.updatePeticio);

// PATCH /api/peticions/:id/status - Admin aprueba/rechaza
router.patch('/:id/status', authenticateToken, isAdmin, validateData(updatePeticioStatusSchema), peticioController.updatePeticioStatus);

export default router;