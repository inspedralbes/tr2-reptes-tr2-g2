import prisma from '../lib/prisma';
import { Request, Response } from 'express';

// GET: Listar todos
export const getCentres = async (req: Request, res: Response) => {
  try {
    const centres = await prisma.centre.findMany();
    res.json(centres);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener centros' });
  }
};

// GET: Uno por ID
export const getCentreById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const centre = await prisma.centre.findUnique({
      where: { id_centre: parseInt(id as string) }
    });
    if (!centre) return res.status(404).json({ error: 'Centro no encontrado' });
    res.json(centre);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener centro' });
  }
};

// POST: Crear
export const createCentre = async (req: Request, res: Response) => {
  try {
    const newCentre = await prisma.centre.create({
      data: req.body // Asegúrate de validar datos en producción
    });
    res.json(newCentre);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear centro' });
  }
};

// PATCH: Marcar asistencia a la reunión
export const updateCentreAttendance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { asistencia_reunion } = req.body;
  try {
    const updated = await prisma.centre.update({
      where: { id_centre: parseInt(id as string) },
      data: { asistencia_reunion }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar asistencia' });
  }
};