import express from 'express';
const router = express.Router();
import * as centroController from '../controllers/centro.controller';

router.get('/', centroController.getCentres);
router.get('/:id', centroController.getCentreById);
router.post('/', centroController.createCentre);
router.patch('/:id/asistencia', centroController.updateCentreAttendance);

export default router;