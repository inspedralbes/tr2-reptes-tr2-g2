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

// Phase 3: Sessions & Attendance
router.get('/:idAssignacio/sessions', authenticateToken, assignacioController.getSessions);
router.get('/:idAssignacio/sessions/:sessionNum', authenticateToken, assignacioController.getSessionAttendance);
router.post('/:idAssignacio/sessions/:sessionNum', authenticateToken, assignacioController.registerAttendance);

export default router;
