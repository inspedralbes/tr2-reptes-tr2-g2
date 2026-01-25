import express from 'express';
const router = express.Router();
import * as professorController from '../controllers/professor.controller';
import { authenticateToken } from '../middlewares/authMiddleware';

router.get('/me/assignments', authenticateToken, professorController.getProfessorAssignments);
router.get('/centre/:idCentre', authenticateToken, professorController.getProfessorsByCentre);
router.get('/', authenticateToken, professorController.getProfessors);
router.post('/', authenticateToken, professorController.createProfessor);
router.put('/:id', authenticateToken, professorController.updateProfessor);
router.delete('/:id', authenticateToken, professorController.deleteProfessor);

export default router;
