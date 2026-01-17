import express from 'express';
const router = express.Router();
import * as alumneController from '../controllers/alumne.controller';

router.get('/', alumneController.getAlumnes);
router.post('/', alumneController.createAlumne);
router.put('/:id', alumneController.updateAlumne);
router.delete('/:id', alumneController.deleteAlumne);

export default router;