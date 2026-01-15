import express from 'express';
const router = express.Router();
import * as alumneController from '../controllers/alumne.controller';

router.get('/', alumneController.getAlumnes);
router.post('/', alumneController.createAlumne);

export default router;