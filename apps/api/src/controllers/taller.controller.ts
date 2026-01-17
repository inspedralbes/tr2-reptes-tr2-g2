// apps/api/src/controllers/taller.controller.ts
import prisma from '../lib/prisma'; // Importamos nuestro cliente singleton
import { Request, Response } from 'express';

// GET: Listar todos los talleres con paginación
export const getTallers = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [tallers, total] = await Promise.all([
    prisma.taller.findMany({
      skip,
      take,
      include: {
        sector: true,
      },
    }),
    prisma.taller.count(),
  ]);

  res.json({
    data: tallers,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    },
  });
};

// GET: Detalle de un taller
export const getTallerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const taller = await prisma.taller.findUnique({
    where: { id_taller: parseInt(id as string) },
    include: {
      sector: true,
    },
  });

  if (!taller) return res.status(404).json({ error: 'Taller no encontrado' });
  res.json(taller);
};

// POST: Crear Taller
export const createTaller = async (req: Request, res: Response) => {
  const { titol, descripcio, durada_h, places_maximes, modalitat, id_sector } = req.body;

  const nuevoTaller = await prisma.taller.create({
    data: {
      titol,
      descripcio_curta: descripcio,
      durada_h: parseInt(durada_h),
      places_maximes: parseInt(places_maximes),
      modalitat,
      id_sector: parseInt(id_sector)
    },
  });
  res.status(201).json(nuevoTaller);
};

// PUT: Actualizar
export const updateTaller = async (req: Request, res: Response) => {
  const { id } = req.params;
  const datos = req.body;

  const tallerActualizado = await prisma.taller.update({
    where: { id_taller: parseInt(id as string) },
    data: datos,
  });
  res.json(tallerActualizado);
};

// DELETE: Borrar
export const deleteTaller = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.taller.delete({
    where: { id_taller: parseInt(id as string) },
  });
  res.json({ message: 'Taller eliminado correctamente' });
};