import prisma from '../lib/prisma';
import { Request, Response } from 'express';

export const getAlumnes = async (req: Request, res: Response) => {
  try {
    const alumnes = await prisma.alumne.findMany({
      include: { centre_procedencia: true } // Trae el nombre del centro
    });
    res.json(alumnes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
};

export const createAlumne = async (req: Request, res: Response) => {
  try {
    const alumne = await prisma.alumne.create({
      data: req.body
    });
    res.json(alumne);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear alumno' });
  }
};