import express from 'express';
import * as statsController from '../controllers/stats.controller';

const router = express.Router();

router.get('/status', statsController.getStatsByStatus);
router.get('/popular', statsController.getPopularWorkshops);
router.get('/activity', statsController.getRecentActivity);
router.get('/search', statsController.getAdvancedSearch);
router.get('/query-step', statsController.queryByStep);
router.patch('/checklist/:id/step', statsController.addChecklistStep);
router.delete('/logs/cleanup', statsController.cleanupLogs);
router.post('/risk-analysis', statsController.runRiskAnalysis);

export default router;
