import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import { ESTADOS_PETICION, EstadoPeticion } from '@enginy/shared';

// GET: Ver peticiones (Filtra por centro si es COORDINADOR)
export const getPeticions = async (req: Request, res: Response) => {
  const { centreId, role } = (req as any).user || {};

  try {
    const where: any = {};
    if (role === 'COORDINADOR' && centreId) {
      where.id_centre = centreId;
    }

    const peticions = await prisma.peticio.findMany({
      where,
      include: {
        centre: true,
        taller: true
      },
      orderBy: {
        data_peticio: 'desc'
      }
    });
    res.json(peticions);
  } catch (error) {
    console.error("Error en peticioController.getPeticions:", error);
    res.status(500).json({ error: 'Error al obtener peticiones' });
  }
};

// POST: Crear solicitud
export const createPeticio = async (req: Request, res: Response) => {
  const { id_taller, alumnes_aprox, comentaris } = req.body;
  const { centreId } = (req as any).user;

  if (!id_taller || !centreId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (id_taller, centreId)' });
  }

  try {
    const nuevaPeticio = await prisma.peticio.create({
      data: {
        id_centre: parseInt(centreId),
        id_taller: parseInt(id_taller),
        alumnes_aprox: alumnes_aprox ? parseInt(alumnes_aprox as string) : null,
        comentaris,
        estat: 'Pendent'
      },
      include: {
        taller: true
      }
    });
    res.json(nuevaPeticio);
  } catch (error) {
    console.error("Error en peticioController.createPeticio:", error);
    res.status(500).json({ error: 'Error al crear petición' });
  }
};



// PATCH: Cambiar estado (Aprobar/Rechazar)
export const updatePeticioStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { estat } = req.body; // 'ACCEPTADA', 'REBUTJADA'
  
  try {
    const updated = await prisma.peticio.update({
      where: { id_peticio: parseInt(id as string) },
      data: { estat: estat as EstadoPeticion }
    });
    
    // AQUÍ IRÍA LA LÓGICA DE CREAR LA ASIGNACIÓN AUTOMÁTICA SI SE ACEPTA
    // Lo haremos más adelante para no complicar ahora.
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};