import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { ROLES } from '@iter/shared';

export const getCalendarEvents = async (req: Request, res: Response) => {
  const { user } = req as any;
  const { start, end } = req.query;

  // Buscar el profesor asociado al usuario (si es rol profesor)
  let professorId: number | null = null;
  if (user.role === ROLES.PROFESOR) {
    // 1. Obtener el usuario completo para ver su nombre
    const fullUser = await prisma.usuari.findUnique({
      where: { id_usuari: user.userId }
    });

    if (fullUser) {
      // 2. Buscar el profesor por nombre
      const professor = await prisma.professor.findFirst({
        where: { nom: fullUser.nom_complet } 
      });
      if (professor) {
        professorId = professor.id_professor;
      }
    }
  }

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
  const [dbEvents, assignments] = await Promise.all([
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
          where: { 
            ...assignmentDateFilter, 
            OR: [
              { professors: { some: { id_usuari: user.userId } } },
              ...(professorId ? [
                { prof1_id: professorId },
                { prof2_id: professorId }
              ] : [])
            ]
          }, 
          include: { taller: true, centre: true } 
        })
      : Promise.resolve([]),
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
        title: user.role === ROLES.COORDINADOR ? `Taller: ${a.titol}` : `${a.taller.titol}`,
        date: a.data_inici.toISOString(),
        type: 'assignment',
        metadata: { 
          id_assignacio: a.id_assignacio,
          centre: a.centre?.nom,
          adreca: a.centre?.adreca,
          hora: '09:00 - 13:00' // Hardcoded for now as it's the standard
        }
      });
    }
  });

  res.json(events);
};
