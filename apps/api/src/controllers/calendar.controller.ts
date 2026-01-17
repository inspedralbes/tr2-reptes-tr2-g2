import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { ROLES } from '@enginy/shared';

export const getCalendarEvents = async (req: Request, res: Response) => {
  const { user } = req as any;
  const { start, end } = req.query;

  // Filtros de fecha opcionales pero recomendados para escalabilidad
  const dateFilter = start && end ? {
    data: {
      gte: new Date(start as string),
      lte: new Date(end as string),
    }
  } : {};

  const assignmentDateFilter = start && end ? {
    OR: [
      { data_inici: { gte: new Date(start as string), lte: new Date(end as string) } },
      { data_fi: { gte: new Date(start as string), lte: new Date(end as string) } },
    ]
  } : {};

  // Ejecutamos consultas en paralelo para mejorar rendimiento
  const [dbEvents, assignments, petitions] = await Promise.all([
    // 1. Milestones
    prisma.calendariEvent.findMany({
      where: dateFilter,
      include: { fase: true }
    }),
    
    // 2. Assignments (basado en rol)
    user.role === ROLES.ADMIN 
      ? prisma.assignacio.findMany({ where: assignmentDateFilter, include: { taller: true, centre: true } })
      : user.role === ROLES.COORDINADOR
      ? prisma.assignacio.findMany({ where: { ...assignmentDateFilter, id_centre: user.centreId }, include: { taller: true } })
      : user.role === ROLES.PROFESOR
      ? prisma.assignacio.findMany({ 
          where: { ...assignmentDateFilter, professors: { some: { id_usuari: user.userId } } }, 
          include: { taller: true, centre: true } 
        })
      : Promise.resolve([]),

    // 3. Petitions (Solo Admin y Coordinador)
    (user.role === ROLES.ADMIN || user.role === ROLES.COORDINADOR)
      ? prisma.peticio.findMany({
          where: {
            ...(user.role === ROLES.COORDINADOR ? { id_centre: user.centreId } : {}),
            ...(user.role === ROLES.ADMIN ? { estat: 'Pendent' } : {}),
            data_peticio: start && end ? { gte: new Date(start as string), lte: new Date(end as string) } : undefined
          },
          include: { taller: true, centre: true }
        })
      : Promise.resolve([])
  ]);

  const events: any[] = [];

  // Mapeo de Milestones
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

  // Mapeo de Assignments
  assignments.forEach((a: any) => {
    if (a.data_inici) {
      events.push({
        id: `assign-${a.id_assignacio}`,
        title: user.role === ROLES.COORDINADOR ? `Taller: ${a.taller.titol}` : `${a.taller.titol} @ ${a.centre.nom}`,
        date: a.data_inici.toISOString(),
        endDate: a.data_fi?.toISOString(),
        type: 'assignment',
        metadata: { id_assignacio: a.id_assignacio }
      });
    }
  });

  // Mapeo de Petitions
  petitions.forEach((p: any) => {
    events.push({
      id: `peticio-${p.id_peticio}`,
      title: user.role === ROLES.ADMIN ? `Pendent: ${p.taller.titol} (${p.centre.nom})` : `Sol·licitud: ${p.taller.titol}`,
      date: p.data_peticio.toISOString(),
      type: 'deadline',
      description: user.role === ROLES.ADMIN ? 'Sol·licitud de taller pendent de validació.' : `Estat: ${p.estat}`
    });
  });

  res.json(events);
};
