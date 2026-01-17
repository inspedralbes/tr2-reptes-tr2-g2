import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import * as calendarController from '../controllers/calendar.controller';

const router = Router();

router.get('/', authenticateToken, calendarController.getCalendarEvents);

export default router;
