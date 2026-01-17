import express from 'express';
const router = express.Router();
import * as professorController from '../controllers/professor.controller';

router.get('/', professorController.getProfessors);
router.post('/', professorController.createProfessor);
router.put('/:id', professorController.updateProfessor);
router.delete('/:id', professorController.deleteProfessor);

export default router;
