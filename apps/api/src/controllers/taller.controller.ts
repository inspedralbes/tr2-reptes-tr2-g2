// apps/api/src/controllers/taller.controller.ts
import prisma from '../lib/prisma'; // Importamos nuestro cliente singleton
import { Request, Response } from 'express';

// GET: Listar todos los talleres
export const getTallers = async (req: Request, res: Response) => {
  try {
    const tallers = await prisma.taller.findMany({
      include: {
        sector: true, // "Populate": Trae el objeto Sector completo, no solo el ID
      },
    });
    res.json(tallers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener talleres' });
  }
};

// GET: Detalle de un taller
export const getTallerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const taller = await prisma.taller.findUnique({
      where: { id_taller: parseInt(id as string) }, // ¡OJO! En URL viene string, en DB es Int. Hay que convertir.
      include: {
        sector: true,
      },
    });

    if (!taller) return res.status(404).json({ error: 'Taller no encontrado' });
    res.json(taller);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el taller' });
  }
};

// POST: Crear Taller
export const createTaller = async (req: Request, res: Response) => {
  // Asumimos que validas los datos antes o los extraes del body
  const { titol, descripcio, durada_h, places_maximes, modalitat, id_sector } = req.body;

  try {
    const nuevoTaller = await prisma.taller.create({
      data: {
        titol,
        descripcio_curta: descripcio, // Asegúrate que coincida con tu schema (descripcio vs descripcio_curta)
        durada_h: parseInt(durada_h),
        places_maximes: parseInt(places_maximes),
        modalitat, // Debe ser "A", "B" o "C" (según tu Enum)
        id_sector: parseInt(id_sector) // Prisma conecta automáticamente la relación usando el ID
      },
    });
    res.status(201).json(nuevoTaller);
  } catch (error) {
    console.error(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.status(500).json({ error: 'Error al crear el taller', details: (error as any).message });
  }
};

// PUT: Actualizar
export const updateTaller = async (req: Request, res: Response) => {
  const { id } = req.params;
  const datos = req.body;

  try {
    const tallerActualizado = await prisma.taller.update({
      where: { id_taller: parseInt(id as string) },
      data: datos, // Prisma ignora los campos que no coinciden, pero mejor filtrar
    });
    res.json(tallerActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
};

// DELETE: Borrar
export const deleteTaller = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.taller.delete({
      where: { id_taller: parseInt(id as string) },
    });
    res.json({ message: 'Taller eliminado correctamente' });
  } catch (error) {
    // Código P2025 es "Record to delete does not exist" en Prisma
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Taller no encontrado' });
    }
    res.status(500).json({ error: 'Error al eliminar' });
  }
};