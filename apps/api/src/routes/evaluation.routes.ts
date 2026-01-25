import express from 'express';
const router = express.Router();
import * as evaluationController from '../controllers/evaluation.controller';
import { authenticateToken } from '../middlewares/authMiddleware';

router.post('/voice-process', authenticateToken, evaluationController.processVoiceEvaluation);

export default router;
