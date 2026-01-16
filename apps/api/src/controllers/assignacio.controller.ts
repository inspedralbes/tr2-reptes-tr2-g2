import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import { AssignmentChecklistSchema } from '@enginy/shared';

// GET: Listar asignaciones de un centro
export const getAssignacionsByCentre = async (req: Request, res: Response) => {
  const { idCentre } = req.params;
  try {
    const assignacions = await prisma.assignacio.findMany({
      where: { id_centre: parseInt(idCentre as string) },
      include: {
        taller: true,
        checklist: true,
        peticio: {
          include: {
            centre: true
          }
        }
      }
    });
    res.json(assignacions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener asignaciones' });
  }
};

// GET: Checklist de una asignación
export const getChecklist = async (req: Request, res: Response) => {
  const { idAssignacio } = req.params;
  try {
    const checklist = await prisma.checklistAssignacio.findMany({
      where: { id_assignacio: parseInt(idAssignacio as string) }
    });
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener checklist' });
  }
};

// PATCH: Actualizar ítem de checklist
export const updateChecklistItem = async (req: Request, res: Response) => {
  const { idItem } = req.params;
  const result = AssignmentChecklistSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: 'Datos de validación inválidos', details: result.error.format() });
  }

  const { completat, url_evidencia } = result.data;

  try {
    const updated = await prisma.checklistAssignacio.update({
      where: { id_checklist: parseInt(idItem as string) },
      data: {
        completat,
        url_evidencia,
        data_completat: completat ? new Date() : null
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar checklist' });
  }
};

// GET: Incidencias de un centro
export const getIncidenciesByCentre = async (req: Request, res: Response) => {
  const { idCentre } = req.params;
  try {
    const incidencies = await prisma.incidencia.findMany({
      where: { id_centre: parseInt(idCentre as string) },
      orderBy: { data_creacio: 'desc' }
    });
    res.json(incidencies);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener incidencias' });
  }
};

// POST: Crear incidencia
export const createIncidencia = async (req: Request, res: Response) => {
  const { id_centre, descripcio } = req.body;
  try {
    const nuevaIncidencia = await prisma.incidencia.create({
      data: {
        id_centre: parseInt(id_centre),
        descripcio
      }
    });
    res.status(201).json(nuevaIncidencia);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear incidencia' });
  }
};
