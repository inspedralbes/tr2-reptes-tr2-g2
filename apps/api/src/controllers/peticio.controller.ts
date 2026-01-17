import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import { EstadoPeticion } from '@iter/shared';
import { connectToDatabase } from '../lib/mongodb';
import { isPhaseActive, PHASES } from '../lib/phaseUtils';

// GET: Ver peticiones (Filtra por centro si es COORDINADOR) con paginación
export const getPeticions = async (req: Request, res: Response) => {
  const { centreId, role } = (req as any).user || {};
  const { page = 1, limit = 10 } = req.query as any;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  try {
    const where: any = {};
    if (role === 'COORDINADOR' && centreId) {
      where.id_centre = centreId;
    }

    const [peticions, total] = await Promise.all([
      prisma.peticio.findMany({
        where,
        skip,
        take,
        include: {
          centre: true,
          taller: true,
          prof1: true,
          prof2: true,
          alumnes: true
        },
        orderBy: {
          data_peticio: 'desc'
        }
      }),
      prisma.peticio.count({ where }),
    ]);

    res.json({
      data: peticions,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error("Error en peticioController.getPeticions:", error);
    res.status(500).json({ error: 'Error al obtener peticiones' });
  }
};

// POST: Crear solicitud
export const createPeticio = async (req: Request, res: Response) => {
  const { 
    id_taller, 
    alumnes_ids,
    comentaris,
    prof1_id,
    prof2_id,
    modalitat
  } = req.body;
  const { centreId } = (req as any).user;

  if (!id_taller || !centreId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (id_taller, centreId)' });
  }

  // --- VERIFICACIÓN DE FASE ---
  const phaseStatus = await isPhaseActive(PHASES.SOLICITUD);
  if (!phaseStatus.isActive) {
    let errorMessage = 'El período de solicitud de talleres no está activo.';
    if (!phaseStatus.phaseActiveFlag) {
      errorMessage = 'La fase de solicitud ha sido desactivada por el administrador.';
    } else if (!phaseStatus.isWithinDates) {
      errorMessage = 'El plazo para solicitar talleres ha finalizado.';
    }
    return res.status(403).json({ error: errorMessage });
  }

  const numAlumnes = alumnes_ids?.length || 0;
  if (modalitat === 'C' && numAlumnes > 4) {
    return res.status(400).json({ error: 'En la Modalidad C, el número máximo de alumnos es 4.' });
  }

  try {
    const existingPeticio = await prisma.peticio.findFirst({
      where: {
        id_centre: parseInt(centreId),
        id_taller: parseInt(id_taller)
      }
    });

    if (existingPeticio) {
      return res.status(400).json({ error: 'Este centro ya ha realizado una solicitud para este taller.' });
    }

    const nuevaPeticio = await prisma.peticio.create({
      data: {
        id_centre: parseInt(centreId),
        id_taller: parseInt(id_taller),
        alumnes_aprox: numAlumnes,
        comentaris,
        estat: 'Pendent',
        modalitat,
        prof1_id: prof1_id ? parseInt(prof1_id) : null,
        prof2_id: prof2_id ? parseInt(prof2_id) : null,
        ids_alumnes: alumnes_ids || [],
        alumnes: {
          connect: alumnes_ids?.map((id: number) => ({ id_alumne: id })) || []
        }
      },
      include: {
        taller: true
      }
    });

    // --- INTEGRACIÓN MONGODB (REPTE 2) ---
    try {
      const { db } = await connectToDatabase();
      
      // 1. Crear Checklist Dinámica (Arrays y Objetos imbricados)
      await db.collection('request_checklists').insertOne({
        id_peticio: nuevaPeticio.id_peticio,
        id_centre: nuevaPeticio.id_centre,
        workshop_title: nuevaPeticio.taller.titol,
        status: 'initializing',
        passos: [
          { pas: 'Revisió de coordinació', completat: false, data: new Date() },
          { pas: 'Assignació de material', completat: false, data: new Date() },
          { pas: 'Confirmació de dates', completat: false, data: new Date() }
        ],
        metadata: {
          created_at: new Date(),
          source: 'web_app',
          priority: nuevaPeticio.modalitat === 'C' ? 'high' : 'normal'
        }
      });

      // 2. Log de Actividad (Agregaciones futuras)
      await db.collection('activity_logs').insertOne({
        tipus_accio: 'CREATE_PETICIO',
        centre_id: nuevaPeticio.id_centre,
        taller_id: nuevaPeticio.id_taller,
        timestamp: new Date(),
        detalls: {
          modalitat: nuevaPeticio.modalitat,
          alumnes_aprox: nuevaPeticio.alumnes_aprox
        }
      });
      
      console.log(`✅ MongoDB: Checklist y Log creados para la petición ${nuevaPeticio.id_peticio}`);
    } catch (mongoError) {
      console.warn('⚠️ MongoDB: No se pudo registrar el checklist/log:', mongoError);
    }

    res.json(nuevaPeticio);
  } catch (error) {
    console.error("Error en peticioController.createPeticio:", error);
    res.status(500).json({ error: 'Error al crear petición' });
  }
};

// PATCH: Cambiar estado (Aprobar/Rechazar)
export const updatePeticioStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { estat } = req.body;
  
  try {
    const updated = await prisma.peticio.update({
      where: { id_peticio: parseInt(id as string) },
      data: { estat: estat as EstadoPeticion }
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};