import express from 'express';
const router = express.Router();
import * as tallerController from '../controllers/taller.controller';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware';

// GET /api/tallers - Listar todos los talleres (público o protegido, según decidas)
router.get('/', tallerController.getTallers);

// GET /api/tallers/:id - Detalle de un taller
router.get('/:id', tallerController.getTallerById);

// POST /api/tallers - Crear taller (Solo Admin)
router.post('/', authenticateToken, isAdmin, tallerController.createTaller);

// PUT /api/tallers/:id - Editar taller
router.put('/:id', authenticateToken, isAdmin, tallerController.updateTaller);

// DELETE /api/tallers/:id - Borrar taller
router.delete('/:id', authenticateToken, isAdmin, tallerController.deleteTaller);

export default router;