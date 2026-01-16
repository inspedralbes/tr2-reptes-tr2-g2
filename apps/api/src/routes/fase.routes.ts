import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import prisma from '../lib/prisma';

const router = Router();

// Get all phases with their status
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const phases = await prisma.fase.findMany({
      orderBy: { data_inici: 'asc' },
      include: {
        _count: {
          select: { events: true }
        }
      }
    });
    res.json(phases);
  } catch (error) {
    console.error('Error fetching phases:', error);
    res.status(500).json({ error: 'Error intern del servidor' });
  }
});

// Update a specific phase (Admin only)
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data_inici, data_fi, activa, nom, descripcio } = req.body;
  const { user } = req as any;

  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accés denegat: Només els administradors poden modificar les fases.' });
  }

  try {
    const updatedFase = await prisma.fase.update({
      where: { id_fase: parseInt(id) },
      data: {
        nom,
        descripcio,
        data_inici: data_inici ? new Date(data_inici) : undefined,
        data_fi: data_fi ? new Date(data_fi) : undefined,
        activa: activa !== undefined ? activa : undefined
      }
    });

    // If activating this phase, deactivate others? (Optional logic)
    if (activa === true) {
      await prisma.fase.updateMany({
        where: { id_fase: { not: parseInt(id) } },
        data: { activa: false }
      });
    }

    res.json(updatedFase);
  } catch (error) {
    console.error('Error updating phase:', error);
    res.status(500).json({ error: 'Error al actualizar la fase' });
  }
});

export default router;
