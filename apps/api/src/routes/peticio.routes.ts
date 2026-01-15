import express from 'express';
const router = express.Router();
// Tendremos que crear este controlador en el siguiente paso
import * as peticioController from '../controllers/peticio.controller';
import { authenticateToken, isAdmin, isCoordinator } from '../middlewares/authMiddleware';

// GET /api/peticions - Admin ve todas, Coordinador ve las suyas
router.get('/', authenticateToken, peticioController.getPeticions);

// POST /api/peticions - Coordinador crea una solicitud
router.post('/', authenticateToken, isCoordinator, peticioController.createPeticio);

// PATCH /api/peticions/:id/status - Admin aprueba/rechaza
router.patch('/:id/status', authenticateToken, isAdmin, peticioController.updatePeticioStatus);

export default router;