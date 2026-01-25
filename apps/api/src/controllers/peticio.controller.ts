import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import { EstadoPeticion } from '@iter/shared';
import { connectToDatabase } from '../lib/mongodb';
import { isPhaseActive, PHASES } from '../lib/phaseUtils';
import { createNotificacioInterna } from './notificacio.controller';

// GET: Ver peticiones (Filtra por centro si es COORDINADOR) con paginación
export const getPeticions = async (req: Request, res: Response) => {
  const { centreId, role } = (req as any).user || {};
  const { page = 1, limit = 10 } = req.query as any;
  const isAll = Number(limit) === 0;
  const skip = isAll ? undefined : (Number(page) - 1) * Number(limit);
  const take = isAll ? undefined : Number(limit);

  try {
    const where: any = {};

    // Scoping: Admin sees all, others only their center
    if (role !== 'ADMIN') {
      if (!centreId) {
        return res.json({ data: [], meta: { total: 0, page: Number(page), limit: Number(limit), totalPages: 0 } });
      }
      where.id_centre = parseInt(centreId.toString());
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
        totalPages: isAll ? 1 : Math.ceil(total / (Number(take) || 1)),
      },
    });
  } catch (error) {
    console.error("Error en peticioController.getPeticions:", error);
    return res.status(500).json({ error: 'Error al obtenir peticions' });
  }
};

// POST: Crear solicitud
export const createPeticio = async (req: Request, res: Response) => {
  const {
    id_taller,
    alumnes_aprox,
    comentaris,
    prof1_id,
    prof2_id,
    modalitat
  } = req.body;
  const { centreId } = (req as any).user;

  if (!id_taller || !centreId || !prof1_id || !prof2_id) {
    return res.status(400).json({ error: 'Falten camps obligatoris (id_taller, centreId, prof1_id, prof2_id)' });
  }

  // --- VERIFICACIÓN DE FASE ---
  const phaseStatus = await isPhaseActive(PHASES.SOLICITUD);
  if (!phaseStatus.isActive) {
    let errorMessage = 'El període de sol·licitud de tallers no està actiu.';
    if (!phaseStatus.phaseActiveFlag) {
      errorMessage = 'La fase de sol·licitud ha estat desactivada per l\'administrador.';
    } else if (!phaseStatus.isWithinDates) {
      errorMessage = 'El termini per sol·licitar tallers ha finalitzat.';
    }
    return res.status(403).json({ error: errorMessage });
  }

  // --- VALIDACIONES DE MODALIDAD C (REGLAS DEL PROGRAMA) ---
  if (modalitat === 'C') {
    if (alumnes_aprox > 4) {
      return res.status(400).json({ error: 'En la Modalitat C, el màxim és de 4 alumnes d\'un mateix institut per projecte.' });
    }

    // Comprobar límite total de 12 alumnos para el centro en Modalidad C
    const peticionsC = await prisma.peticio.findMany({
      where: {
        id_centre: parseInt(centreId),
        modalitat: 'C'
      }
    });

    const totalAlumnesC = peticionsC.reduce((sum: number, p: any) => sum + (p.alumnes_aprox || 0), 0);
    if (totalAlumnesC + alumnes_aprox > 12) {
      return res.status(400).json({
        error: `Límit superat. L'institut ja té ${totalAlumnesC} alumnes en projectes de Modalitat C. El màxim total permès és 12.`
      });
    }
  }

  try {
    const existingPeticio = await prisma.peticio.findFirst({
      where: {
        id_centre: parseInt(centreId),
        id_taller: parseInt(id_taller)
      }
    });

    if (existingPeticio) {
      return res.status(400).json({ error: 'Aquest centre ja ha realitzat una sol·licitud per a aquest taller.' });
    }

    const nuevaPeticio = await prisma.peticio.create({
      data: {
        id_centre: parseInt(centreId),
        id_taller: parseInt(id_taller),
        alumnes_aprox: parseInt(alumnes_aprox),
        comentaris,
        estat: 'Pendent',
        modalitat,
        prof1_id: parseInt(prof1_id),
        prof2_id: parseInt(prof2_id),
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
        id_taller: nuevaPeticio.id_taller,
        workshop_title: nuevaPeticio.taller.titol,
        status: 'pendent',
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
        workshop_title: nuevaPeticio.taller.titol,
        timestamp: new Date(),
        detalls: {
          modalitat: nuevaPeticio.modalitat,
          alumnes_aprox: nuevaPeticio.alumnes_aprox
        }
      });


    } catch (mongoError) {
      console.warn('⚠️ MongoDB: No se pudo registrar el checklist/log:', mongoError);
    }

    res.json(nuevaPeticio);
  } catch (error) {
    console.error("Error en peticioController.createPeticio:", error);
    res.status(500).json({ error: 'Error al crear la petició' });
  }
};

// PUT: Actualizar solicitud existente (solo campos permitidos y si está Pendent)
export const updatePeticio = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    alumnes_aprox,
    comentaris,
    prof1_id,
    prof2_id,
  } = req.body;
  const { centreId, role } = (req as any).user;

  try {
    const peticioId = parseInt(id as string);
    const existingPeticio = await prisma.peticio.findUnique({
      where: { id_peticio: peticioId }
    });

    if (!existingPeticio) {
      return res.status(404).json({ error: 'Petició no trobada.' });
    }

    // Verificar permisos: Coordinador solo edita las suyas
    if (role !== 'ADMIN' && existingPeticio.id_centre !== parseInt(centreId)) {
      return res.status(403).json({ error: 'No tens permís per editar aquesta petició.' });
    }

    // Verificar estado: Solo se pueden editar las pendientes
    if (existingPeticio.estat !== 'Pendent') {
      return res.status(400).json({ error: 'Només es poden editar peticions pendents.' });
    }

    // --- VERIFICACIÓN DE FASE ---
    // Si NO es admin, verificamos la fase. Los admins pueden editar siempre.
    if (role !== 'ADMIN') {
      const phaseStatus = await isPhaseActive(PHASES.SOLICITUD);
      if (!phaseStatus.isActive) {
        let errorMessage = 'El període de sol·licitud de tallers no està actiu.';
        if (!phaseStatus.phaseActiveFlag) {
          errorMessage = 'La fase de sol·licitud ha estat desactivada per l\'administrador.';
        } else if (!phaseStatus.isWithinDates) {
          errorMessage = 'El termini per sol·licitar tallers ha finalitzat.';
        }
        return res.status(403).json({ error: errorMessage });
      }
    }

    // --- VALIDACIONES DE MODALIDAD C (REGLAS DEL PROGRAMA) ---
    if (existingPeticio.modalitat === 'C' && alumnes_aprox !== undefined) {
      const nuevosAlumnes = parseInt(alumnes_aprox);
      if (nuevosAlumnes > 4) {
        return res.status(400).json({ error: 'En la Modalitat C, el màxim és de 4 alumnes d\'un mateix institut per projecte.' });
      }

      // Comprobar límite total de 12 alumnos (excluyendo la cantidad actual de esta petición)
      const peticionsC = await prisma.peticio.findMany({
        where: {
          id_centre: existingPeticio.id_centre,
          modalitat: 'C',
          id_peticio: { not: peticioId } // Excluir la actual
        }
      });

      const totalAlumnesC = peticionsC.reduce((sum: number, p: any) => sum + (p.alumnes_aprox || 0), 0);
      if (totalAlumnesC + nuevosAlumnes > 12) {
        return res.status(400).json({
          error: `Límit superat. L'institut ja té ${totalAlumnesC} alumnes en altres projectes de Modalitat C. Amb aquest canvi (${nuevosAlumnes}) superaria el màxim de 12.`
        });
      }
    }

    const updatedPeticio = await prisma.peticio.update({
      where: { id_peticio: peticioId },
      data: {
        alumnes_aprox: alumnes_aprox ? parseInt(alumnes_aprox) : undefined,
        comentaris,
        prof1_id: parseInt(prof1_id),
        prof2_id: parseInt(prof2_id),
      },
      include: {
        taller: true
      }
    });

    // Log de actividad
    try {
      const { db } = await connectToDatabase();
      await db.collection('activity_logs').insertOne({
        tipus_accio: 'UPDATE_PETICIO',
        centre_id: existingPeticio.id_centre,
        taller_id: existingPeticio.id_taller,
        peticio_id: existingPeticio.id_peticio,
        timestamp: new Date(),
        detalls: {
          previous_alumnes: existingPeticio.alumnes_aprox,
          new_alumnes: alumnes_aprox
        }
      });
    } catch (e) {
      console.warn('Could not log activity', e);
    }

    res.json(updatedPeticio);
  } catch (error) {
    console.error("Error en peticioController.updatePeticio:", error);
    res.status(500).json({ error: 'Error al actualitzar la petició' });
  }
};

// PATCH: Cambiar estado (Aprobar/Rechazar)
export const updatePeticioStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { estat } = req.body;

  try {
    const updated = await prisma.peticio.update({
      where: { id_peticio: parseInt(id as string) },
      data: { estat: estat as EstadoPeticion },
      include: { taller: true }
    });

    await createNotificacioInterna({
      id_centre: updated.id_centre,
      titol: `Sol·licitud ${updated.estat === 'Aprovada' ? 'Aprovada' : 'Rebutjada'}`,
      missatge: `La teva sol·licitud per al taller "${updated.taller.titol}" ha estat ${updated.estat.toLowerCase()}.`,
      tipus: 'PETICIO',
      importancia: updated.estat === 'Aprovada' ? 'INFO' : 'WARNING'
    });

    // --- INTEGRACIÓN MONGODB ---
    try {
      const { db } = await connectToDatabase();
      await db.collection('request_checklists').updateOne(
        { id_peticio: updated.id_peticio },
        { $set: { status: updated.estat.toLowerCase() } }
      );
      await db.collection('activity_logs').insertOne({
        tipus_accio: updated.estat === 'Aprovada' ? 'APPROVE_PETICIO' : 'REJECT_PETICIO',
        centre_id: updated.id_centre,
        taller_id: updated.id_taller,
        timestamp: new Date(),
        detalls: { estat_anterior: 'Pendent', estat_nou: updated.estat }
      });
    } catch (mongoError) {
      console.warn('⚠️ MongoDB Sync Error:', mongoError);
    }

    res.json(updated);
  } catch (error) {
    console.error("Error en updatePeticioStatus:", error);
    res.status(500).json({ error: 'Error al actualitzar l\'estat' });
  }
};