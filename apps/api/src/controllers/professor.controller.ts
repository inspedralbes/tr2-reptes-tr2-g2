import prisma from '../lib/prisma';
import { Request, Response } from 'express';

export const getProfessors = async (req: Request, res: Response) => {
  const { centreId, role } = (req as any).user || {};

  try {
    const where: any = {};
    if (role === 'COORDINADOR' && centreId) {
      where.id_centre = parseInt(centreId);
    }

    const professors = await prisma.professor.findMany({
      where,
      include: { centre: true }
    });
    res.json(professors);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener profesores' });
  }
};

export const createProfessor = async (req: Request, res: Response) => {
  const { centreId } = (req as any).user;
  try {
    const professor = await prisma.professor.create({
      data: {
        ...req.body,
        id_centre: centreId ? parseInt(centreId) : req.body.id_centre
      }
    });
    res.json(professor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear profesor' });
  }
};

export const updateProfessor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nom, contacte, id_centre } = req.body;
  try {
    const professor = await prisma.professor.update({
      where: { id_professor: parseInt(id as string) },
      data: {
        nom, contacte,
        id_centre: id_centre ? parseInt(id_centre as string) : undefined
      }
    });
    res.json(professor);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar profesor' });
  }
};

export const deleteProfessor = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.professor.delete({
      where: { id_professor: parseInt(id as string) }
    });
    res.json({ message: 'Profesor eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar profesor' });
  }
};
