import express from 'express';
const router = express.Router();
import * as tallerController from '../controllers/taller.controller';

// GET /api/tallers - Listar todos los talleres (público o protegido, según decidas)
router.get('/', tallerController.getTallers);

// GET /api/tallers/:id - Detalle de un taller
router.get('/:id', tallerController.getTallerById);

// POST /api/tallers - Crear taller (Solo Admin)
// Aquí podrías meter middleware de auth: router.post('/', authMiddleware, tallerController.createTaller);
router.post('/', tallerController.createTaller);

// PUT /api/tallers/:id - Editar taller
router.put('/:id', tallerController.updateTaller);

// DELETE /api/tallers/:id - Borrar taller
router.delete('/:id', tallerController.deleteTaller);

export default router;