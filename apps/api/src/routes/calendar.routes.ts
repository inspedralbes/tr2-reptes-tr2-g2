import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/authMiddleware';
import { CALENDARI, ROLES } from '@enginy/shared';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  const { user } = req as any;

  try {
    const events: any[] = [];

    // 1. Add Global Milestones (from shared constants)
    events.push(
      {
        id: 'milestone-presentation',
        title: 'Reunió de Presentació',
        date: CALENDARI.REUNION_PRESENTACION,
        type: 'milestone',
        description: 'Inici del curs i presentació del Programa Enginy.'
      },
      {
        id: 'milestone-demanda',
        title: 'Límit enviament demanda',
        date: CALENDARI.LIMITE_DEMANDA,
        type: 'deadline',
        description: 'Darrer dia per sol·licitar els tallers.'
      },
      {
        id: 'milestone-asignaciones',
        title: 'Comunicació d\'assignacions',
        date: CALENDARI.COMUNICACION_ASIGNACIONES,
        type: 'milestone',
        description: 'Es publiquen les llistes definitives.'
      }
    );

    // 2. Role-based event fetching
    if (user.role === ROLES.ADMIN) {
      // Admins see all assignments
      const assignments = await prisma.assignacio.findMany({
        include: {
          taller: true,
          centre: true
        }
      });
      
      assignments.forEach(a => {
        if (a.data_inici) {
          events.push({
            id: `assign-${a.id_assignacio}`,
            title: `${a.taller.titol} @ ${a.centre.nom}`,
            date: a.data_inici.toISOString(),
            endDate: a.data_fi?.toISOString(),
            type: 'assignment',
            metadata: { id_assignacio: a.id_assignacio }
          });
        }
      });
    } else if (user.role === ROLES.COORDINADOR) {
      // Coordinators see their center's assignments
      const assignments = await prisma.assignacio.findMany({
        where: { id_centre: user.centreId },
        include: {
          taller: true
        }
      });

      assignments.forEach(a => {
        if (a.data_inici) {
          events.push({
            id: `assign-${a.id_assignacio}`,
            title: `Taller: ${a.taller.titol}`,
            date: a.data_inici.toISOString(),
            endDate: a.data_fi?.toISOString(),
            type: 'assignment',
            metadata: { id_assignacio: a.id_assignacio }
          });
        }
      });
    }

    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Error intern del servidor' });
  }
});

export default router;
