import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import { ESTADOS_PETICION, EstadoPeticion } from '@enginy/shared';

// GET: Ver peticiones (Idealmente filtrar por rol aquí)
export const getPeticions = async (req: Request, res: Response) => {
  try {
    const peticions = await prisma.peticio.findMany({
      include: {
        centre: true,
        taller: true
      }
    });
    res.json(peticions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener peticiones' });
  }
};

// POST: Crear solicitud
export const createPeticio = async (req: Request, res: Response) => {
  const { id_centre, id_taller, alumnes_aprox, comentaris } = req.body;
  try {
    const nuevaPeticio = await prisma.peticio.create({
      data: {
        centre: { connect: { id: parseInt(id_centre) } },
        taller: { connect: { id: parseInt(id_taller) } },
        alumnes_aprox: parseInt(alumnes_aprox),
        comentaris,
        estat: ESTADOS_PETICION.PENDIENTE as EstadoPeticion
      }
    });
    res.json(nuevaPeticio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear petición' });
  }
};

// PATCH: Cambiar estado (Aprobar/Rechazar)
export const updatePeticioStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { estat } = req.body; // 'ACCEPTADA', 'REBUTJADA'
  
  try {
    const updated = await prisma.peticio.update({
      where: { id: parseInt(id as string) },
      data: { estat: estat as EstadoPeticion }
    });
    
    // AQUÍ IRÍA LA LÓGICA DE CREAR LA ASIGNACIÓN AUTOMÁTICA SI SE ACEPTA
    // Lo haremos más adelante para no complicar ahora.
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};