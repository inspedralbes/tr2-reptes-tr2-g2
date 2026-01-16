import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import { ROLES } from '@enginy/shared';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  const { user } = req as any;

  try {
    const events: any[] = [];

    // 1. Add Program Milestones from Database
    const dbEvents = await prisma.calendariEvent.findMany({
      include: { fase: true }
    });

    dbEvents.forEach((e: any) => {
      events.push({
        id: `milestone-${e.id_event}`,
        title: e.titol,
        date: e.data.toISOString(),
        type: e.tipus,
        description: e.descripcio || '',
        metadata: { fase: e.fase.nom }
      });
    });

    // 2. Role-based event fetching
    if (user.role === ROLES.ADMIN) {
      // Admins see all assignments
      const assignments = await prisma.assignacio.findMany({
        include: { taller: true, centre: true }
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

      // Admins see all petitions as "Pending tasks"
      const petitions = await prisma.peticio.findMany({
        where: { estat: 'Pendent' },
        include: { taller: true, centre: true }
      });

      petitions.forEach(p => {
        events.push({
          id: `peticio-${p.id_peticio}`,
          title: `Pendent: ${p.taller.titol} (${p.centre.nom})`,
          date: p.data_peticio.toISOString(),
          type: 'deadline',
          description: 'Sol·licitud de taller pendent de validació.'
        });
      });

    } else if (user.role === ROLES.COORDINADOR) {
      // Coordinators see their center's assignments
      const assignments = await prisma.assignacio.findMany({
        where: { id_centre: user.centreId },
        include: { taller: true }
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

      // Coordinators see their own petitions
      const petitions = await prisma.peticio.findMany({
        where: { id_centre: user.centreId },
        include: { taller: true }
      });

      petitions.forEach(p => {
        events.push({
          id: `peticio-${p.id_peticio}`,
          title: `Sol·licitud: ${p.taller.titol}`,
          date: p.data_peticio.toISOString(),
          type: 'deadline',
          description: `Estat: ${p.estat}`
        });
      });
    } else if (user.role === ROLES.PROFESOR) {
      // Professors see assignments where they are involved
      const assignments = await prisma.assignacio.findMany({
        where: {
          professors: {
            some: { id_usuari: user.userId }
          }
        },
        include: {
          taller: true,
          centre: true
        }
      });

      assignments.forEach(a => {
        if (a.data_inici) {
          events.push({
            id: `assign-${a.id_assignacio}`,
            title: `Taller: ${a.taller.titol} (${a.centre.nom})`,
            date: a.data_inici.toISOString(),
            endDate: a.data_fi?.toISOString(),
            type: 'assignment',
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
