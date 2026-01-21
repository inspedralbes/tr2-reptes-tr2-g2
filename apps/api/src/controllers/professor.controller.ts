import prisma from '../lib/prisma';
import { Request, Response } from 'express';

export const getProfessors = async (req: Request, res: Response) => {
  const { centreId, role } = (req as any).user || {};

  try {
    const where: any = {};
    
    // Scoping: Admin sees all, others only their center
    if (role !== 'ADMIN') {
      if (!centreId) {
        return res.json([]); // No center assigned, no access
      }
      where.id_centre = parseInt(centreId.toString());
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
      data: req.body
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

export const getProfessorAssignments = async (req: Request, res: Response) => {
  const { userId, centreId } = (req as any).user;

  try {
    if (!centreId) {
      return res.json([]);
    }

    const assignments = await prisma.assignacio.findMany({
      where: {
        id_centre: parseInt(centreId)
      },
      include: {
        taller: true,
        centre: true,
        prof1: true,
        prof2: true,
        professors: {
          include: {
            usuari: {
              select: {
                nom_complet: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json(assignments);
  } catch (error) {
    console.error("Error fetching professor assignments:", error);
    res.status(500).json({ error: 'Error al obtener las asignaciones del centro.' });
  }
};
