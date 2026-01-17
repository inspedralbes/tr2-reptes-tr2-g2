import express from 'express';
const router = express.Router();
import * as assignacioController from '../controllers/assignacio.controller';
import { authenticateToken } from '../middlewares/authMiddleware';

// /api/assignacions
router.get('/centre/:idCentre', authenticateToken, assignacioController.getAssignacionsByCentre);
router.get('/:idAssignacio/checklist', authenticateToken, assignacioController.getChecklist);
router.patch('/checklist/:idItem', authenticateToken, assignacioController.updateChecklistItem);
router.get('/incidencies/centre/:idCentre', authenticateToken, assignacioController.getIncidenciesByCentre);
router.post('/incidencies', authenticateToken, assignacioController.createIncidencia);
router.post('/', authenticateToken, assignacioController.createAssignacioFromPeticio);
router.post('/:idAssignacio/inscripcions', authenticateToken, assignacioController.createInscripcions);

export default router;
