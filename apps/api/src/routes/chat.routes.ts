
import { Router } from 'express';
import { processChatMessage } from '../controllers/chat.controller';
import { authenticateToken } from '../middlewares/authMiddleware';
// I'll assume authentication is required as it's a "coordinator" tool.

const router = Router();

// POST /api/chat
router.post('/', authenticateToken, processChatMessage);

export default router;
