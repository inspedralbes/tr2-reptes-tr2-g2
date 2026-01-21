import express from 'express';
const router = express.Router();
import * as assignacioController from '../controllers/assignacio.controller';
import * as tetrisController from '../controllers/tetris.controller';
import * as enrollmentController from '../controllers/enrollment.controller';
import { authenticateToken } from '../middlewares/authMiddleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

// /api/assignacions
router.get('/centre/:idCentre', authenticateToken, assignacioController.getAssignacionsByCentre);
router.get('/:idAssignacio/checklist', authenticateToken, assignacioController.getChecklist);
router.patch('/checklist/:idItem', authenticateToken, assignacioController.updateChecklistItem);
router.get('/incidencies/centre/:idCentre', authenticateToken, assignacioController.getIncidenciesByCentre);
router.post('/incidencies', authenticateToken, assignacioController.createIncidencia);
router.post('/', authenticateToken, assignacioController.createAssignacioFromPeticio);
router.post('/:idAssignacio/inscripcions', authenticateToken, assignacioController.createInscripcions);
router.post('/auto-generate', authenticateToken, assignacioController.generateAutomaticAssignments);
router.post('/auto-generate', authenticateToken, assignacioController.generateAutomaticAssignments);

// Phase 2 Specifics
router.post('/tetris', authenticateToken, tetrisController.triggerTetris);
router.post('/:idAssignacio/enrollment/excel', authenticateToken, upload.single('file'), enrollmentController.enrollStudentsViaExcel);
router.patch('/checklist/designate-profs/:idAssignacio', authenticateToken, assignacioController.designateProfessors);
router.post('/upload/validate', authenticateToken, upload.single('file'), assignacioController.validateDocumentUpload);

// Phase 3: Sessions & Attendance
router.get('/:idAssignacio/sessions', authenticateToken, assignacioController.getSessions);
router.get('/:idAssignacio/sessions/:sessionNum', authenticateToken, assignacioController.getSessionAttendance);
router.post('/:idAssignacio/sessions/:sessionNum', authenticateToken, assignacioController.registerAttendance);

// Phase 4: Closing
router.post('/:idAssignacio/close', authenticateToken, assignacioController.closeAssignacio);

export default router;
