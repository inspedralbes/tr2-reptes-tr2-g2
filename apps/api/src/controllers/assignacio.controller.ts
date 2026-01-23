import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import { AssignmentChecklistSchema, ROLES } from '@iter/shared';
import { isPhaseActive, PHASES } from '../lib/phaseUtils';

// GET: Una asignación por ID (Detalle completo)
export const getAssignacioById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { centreId, role } = (req as any).user;

  try {
    const assignacio = await prisma.assignacio.findUnique({
      where: { id_assignacio: parseInt(id) },
      include: {
        taller: true,
        centre: true,
        checklist: true,
        prof1: true,
        prof2: true,
        sessions: true,
        professors: {
          include: {
            usuari: true
          }
        },
        inscripcions: {
          include: {
            alumne: true
          }
        }
      }
    });

    if (!assignacio) {
      return res.status(404).json({ error: 'Assignació no trobada' });
    }

    // Security Scoping
    if (role !== 'ADMIN' && assignacio.id_centre !== centreId) {
      return res.status(403).json({ error: 'Accés denegat' });
    }

    res.json(assignacio);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir el detall de l\'assignació' });
  }
};

// GET: Listar asignaciones de un centro
export const getAssignacionsByCentre = async (req: Request, res: Response) => {
  const { idCentre } = req.params;
  const { centreId, role } = (req as any).user;

  // Security Scoping
  if (role !== 'ADMIN' && parseInt(idCentre as string) !== centreId) {
    return res.status(403).json({ error: 'Accés denegat: No pots veure les assignacions d\'altre centre' });
  }

  try {
    const assignacions = await prisma.assignacio.findMany({
      where: { id_centre: parseInt(idCentre as string) },
      include: {
        taller: true,
        centre: true,
        checklist: true,
        sessions: {
          orderBy: { data_sessio: 'asc' },
          take: 1
        },
        inscripcions: {
          include: {
            alumne: true,
            avaluacio_docent: true
          }
        }
      }
    });
    res.json(assignacions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener asignaciones' });
  }
};

// GET: Checklist de una asignación
export const getChecklist = async (req: Request, res: Response) => {
  const { idAssignacio } = req.params;
  try {
    const checklist = await prisma.checklistAssignacio.findMany({
      where: { id_assignacio: parseInt(idAssignacio as string) }
    });
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener checklist' });
  }
};

// PATCH: Actualizar ítem de checklist
export const updateChecklistItem = async (req: Request, res: Response) => {
  const { idItem } = req.params;
  const result = AssignmentChecklistSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: 'Datos de validación inválidos', details: result.error.format() });
  }

  const { completat, url_evidencia } = result.data;

  try {
    const updated = await prisma.checklistAssignacio.update({
      where: { id_checklist: parseInt(idItem as string) },
      data: {
        completat,
        url_evidencia,
        data_completat: completat ? new Date() : null
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar checklist' });
  }
};

// GET: Incidencias de un centro
export const getIncidenciesByCentre = async (req: Request, res: Response) => {
  const { idCentre } = req.params;
  const { centreId, role } = (req as any).user;

  // Security Scoping
  if (role !== 'ADMIN' && parseInt(idCentre as string) !== centreId) {
    return res.status(403).json({ error: 'Accés denegat: No pots veure les incidències d\'altre centre' });
  }

  try {
    const incidencies = await prisma.incidencia.findMany({
      where: { id_centre: parseInt(idCentre as string) },
      orderBy: { data_creacio: 'desc' }
    });
    res.json(incidencies);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener incidencias' });
  }
};

// POST: Crear incidencia
export const createIncidencia = async (req: Request, res: Response) => {
  const { id_centre, descripcio } = req.body;
  try {
    const nuevaIncidencia = await prisma.incidencia.create({
      data: {
        id_centre: parseInt(id_centre),
        descripcio
      }
    });
    res.status(201).json(nuevaIncidencia);
  } catch (error) {
    console.error("Error al crear incidencia:", error);
    res.status(500).json({ error: 'Error al crear la incidencia y ejecutar análisis de riesgo' });
  }
};

// POST: Validar subida de documento (Vision AI)
import { VisionService } from '../services/vision.service';

export const validateDocumentUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }

    const visionService = new VisionService();
    const validation = await visionService.validateDocument(req.file);

    if (!validation.valid) {
      // Rechazar subida
      return res.status(400).json({
        error: 'Documento rechazado por la IA.',
        details: validation.errors,
        metadata: validation.metadata
      });
    }

    // Si es válido, aquí iría la lógica para guardar en S3/Disco
    // const s3Url = await uploadToS3(req.file);

    res.json({
      success: true,
      message: 'Documento validado y aceptado correctamente.',
      metadata: validation.metadata
      // url: s3Url
    });

  } catch (error) {
    console.error("Error en validación de documento:", error);
    res.status(500).json({ error: 'Error al procesar el documento.' });
  }
};

// POST: Crear Asignación desde Petición (Admin Only)
export const createAssignacioFromPeticio = async (req: Request, res: Response) => {
  const { idPeticio } = req.body;
  const { role } = (req as any).user;

  if (role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Solo los administradores pueden realizar asignaciones.' });
  }

  try {
    const peticio = await prisma.peticio.findUnique({
      where: { id_peticio: parseInt(idPeticio) },
      include: { centre: true, taller: true }
    });

    if (!peticio) {
      return res.status(404).json({ error: 'Petición no encontrada.' });
    }

    if (peticio.estat !== 'Aprovada') {
      return res.status(400).json({ error: 'La petición debe estar aprobada para crear una asignación.' });
    }

    // Comprobar si ya existe una asignación para esta petición
    const existing = await prisma.assignacio.findFirst({
      where: { id_peticio: peticio.id_peticio }
    });

    if (existing) {
      return res.status(400).json({ error: 'Ya existe una asignación para esta petición.' });
    }

    const nuevaAssignacio = await prisma.assignacio.create({
      data: {
        id_peticio: peticio.id_peticio,
        id_centre: peticio.id_centre,
        id_taller: peticio.id_taller,
        estat: 'En_curs',
        prof1_id: peticio.prof1_id ?? undefined,
        prof2_id: peticio.prof2_id ?? undefined,
        // Inicializar checklist por defecto para Fase 2
        // SIEMPRE 3 pasos para consistencia visual, pero Marcando como completado el que no aplique
        checklist: {
          create: [
            { pas_nom: 'Designar Profesores Referentes', completat: false },
            { pas_nom: 'Subir Registro Nominal (Excel)', completat: false },
            { pas_nom: 'Acuerdo Pedagógico (Modalidad C)', completat: peticio.modalitat !== 'C' }
          ]
        }
      }
    });

    res.status(201).json(nuevaAssignacio);
  } catch (error) {
    console.error("Error al crear asignación:", error);
    res.status(500).json({ error: 'Error al crear la asignación.' });
  }
};

// POST: Realizar Registro Nominal (Inscribir alumnos en una asignación)
export const createInscripcions = async (req: Request, res: Response) => {
  const idAssignacio = parseInt(req.params.idAssignacio as string);
  const { ids_alumnes } = req.body; // Array de IDs de alumnos

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verificar existencia de la asignación
      const assignacio = await tx.assignacio.findUnique({
        where: { id_assignacio: idAssignacio },
        include: { inscripcions: true }
      });

      if (!assignacio) {
        throw new Error('Asignación no encontrada.');
      }

      // 2. Sincronizar inscripciones (en lugar de borrar todo)
      const currentIds = assignacio.inscripcions.map((i: any) => i.id_alumne);
      const newIds = ids_alumnes.map((id: any) => parseInt(id));

      const toAdd = newIds.filter((id: number) => !currentIds.includes(id));
      const toRemove = currentIds.filter((id: number) => !newIds.includes(id));

      // Eliminar desaparecidos
      if (toRemove.length > 0) {
        await tx.inscripcio.deleteMany({
          where: {
            id_assignacio: idAssignacio,
            id_alumne: { in: toRemove }
          }
        });
      }

      // Añadir nuevos
      for (const idAlumne of toAdd) {
        await tx.inscripcio.create({
          data: {
            id_assignacio: idAssignacio,
            id_alumne: idAlumne
          }
        });
      }

      // 3. Marcar el ítem del checklist como completado
      await tx.checklistAssignacio.updateMany({
        where: {
          id_assignacio: idAssignacio,
          pas_nom: { contains: 'Registro Nominal' }
        },
        data: {
          completat: true,
          data_completat: new Date()
        }
      });

      return { added: toAdd.length, removed: toRemove.length, total: newIds.length };
    });

    res.json({ message: 'Registro nominal sincronizado correctamente', details: result });
  } catch (error: any) {
    console.error("Error al realizar registro nominal:", error);
    if (error.message === 'Asignación no encontrada.') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al realizar el registro nominal.' });
  }
};

// PATCH: Designar profesores para una asignación
export const designateProfessors = async (req: Request, res: Response) => {
  const { idAssignacio } = req.params;
  const { prof1_id, prof2_id } = req.body;

  try {
    const updated = await prisma.assignacio.update({
      where: { id_assignacio: parseInt(idAssignacio as string) },
      data: {
        prof1_id,
        prof2_id
      }
    });

    // Actualizar checklist
    await prisma.checklistAssignacio.updateMany({
      where: {
        id_assignacio: parseInt(idAssignacio as string),
        pas_nom: { contains: 'Profesores Referentes' }
      },
      data: {
        completat: true,
        data_completat: new Date()
      }
    });

    res.json(updated);
  } catch (error) {
    console.error("Error al designar profesores:", error);
    res.status(500).json({ error: 'Error al designar profesores.' });
  }
};

// POST: Generar Asignaciones Automáticas (AI)
import { AutoAssignmentService } from '../services/auto-assignment.service';

export const generateAutomaticAssignments = async (req: Request, res: Response) => {
  const { role } = (req as any).user;
  // if (role !== ROLES.ADMIN) return res.status(403).json({ error: 'No autorizado' });

  try {
    const service = new AutoAssignmentService();
    const result = await service.generateAssignments();
    res.json(result);
  } catch (error) {
    console.error("Error en asignación automática:", error);
    res.status(500).json({ error: 'Error al ejecutar el motor de asignación.' });
  }
};

// Phase 3: Sessions & Attendance
export const getSessions = async (req: Request, res: Response) => {
  const { idAssignacio } = req.params;
  try {
    const sessions = await prisma.sessio.findMany({
      where: { id_assignacio: parseInt(idAssignacio as string) },
      orderBy: { data_sessio: 'asc' }
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir sessions' });
  }
};

export const getSessionAttendance = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Funcionalitat no implementada: getSessionAttendance' });
};

export const registerAttendance = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Funcionalitat no implementada: registerAttendance' });
};

// Phase 2: Teaching Staff Management
export const addTeachingStaff = async (req: Request, res: Response) => {
  const idAssignacio = req.params.idAssignacio as string;
  const { idUsuari, esPrincipal } = req.body;

  try {
    const relation = await prisma.assignacioProfessor.create({
      data: {
        id_assignacio: parseInt(idAssignacio),
        id_usuari: parseInt(idUsuari),
        es_principal: esPrincipal || false
      }
    });
    res.status(201).json(relation);
  } catch (error) {
    res.status(500).json({ error: 'Error al afegir professor a l\'equip' });
  }
};

export const removeTeachingStaff = async (req: Request, res: Response) => {
  const idAssignacio = req.params.idAssignacio as string;
  const idUsuari = req.params.idUsuari as string;

  try {
    await prisma.assignacioProfessor.delete({
      where: {
        id_assignacio_id_usuari: {
          id_assignacio: parseInt(idAssignacio),
          id_usuari: parseInt(idUsuari)
        }
      }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar professor de l\'equip' });
  }
};

// Phase 4: Closing
export const closeAssignacio = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Funcionalitat no implementada: closeAssignacio' });
};
