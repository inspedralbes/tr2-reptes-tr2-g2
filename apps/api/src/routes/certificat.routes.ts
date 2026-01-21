import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import * as certificatController from '../controllers/certificat.controller';

const router = Router();

router.post('/generate', authenticateToken, certificatController.generateCertificates);
router.get('/my-certificates', authenticateToken, certificatController.getMyCertificates);

export default router;
