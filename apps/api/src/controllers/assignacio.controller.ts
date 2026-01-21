import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import { AssignmentChecklistSchema, ROLES } from '@iter/shared';
import { isPhaseActive, PHASES } from '../lib/phaseUtils';

// GET: Listar asignaciones de un centro
export const getAssignacionsByCentre = async (req: Request, res: Response) => {
  const { idCentre } = req.params;
  try {
    const assignacions = await prisma.assignacio.findMany({
      where: { id_centre: parseInt(idCentre as string) },
      include: {
        taller: true,
        checklist: true,
        inscripcions: {
          include: {
            alumne: true,
            avaluacio_docent: true
          }
        },
        peticio: {
          include: {
            centre: true
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
    res.status(500).json({ error: 'Error al ejecutar análisis de riesgo' });
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
        checklist: {
          create: [
            { pas_nom: 'Designar Profesores Referentes', completat: false },
            { pas_nom: 'Subir Registro Nominal (Excel)', completat: false },
            { pas_nom: 'Gestionar Acuerdo Pedagógico (Modalidad C)', completat: peticio.modalitat !== 'C' }
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
  const idAssignacio = req.params.idAssignacio as string;
  const { ids_alumnes } = req.body; // Array de IDs de alumnos

  try {
    const assignacio = await prisma.assignacio.findUnique({
      where: { id_assignacio: parseInt(idAssignacio) }
    });

    if (!assignacio) {
      return res.status(404).json({ error: 'Asignación no encontrada.' });
    }

    // 1. Crear las inscripciones
    const inscripcions = await Promise.all(
      ids_alumnes.map((idAlumne: number) =>
      ids_alumnes.map((idAlumne: number) =>
        prisma.inscripcio.upsert({
          where: {
          where: {
            // Necesitaríamos una clave única para inscripciones si quisiéramos upsert real,
            // pero como no hay, usaremos create o simplemente borraremos las anteriores
            id_inscripcio: -1 // Truco para forzar el fallo si no existe y crear
          },
          update: {},
          create: {
            id_assignacio: parseInt(idAssignacio),
            id_alumne: idAlumne
          }
        }).catch(() =>
          // Si falla (porque el ID -1 no existe), creamos normalmente
          prisma.inscripcio.create({
            data: {
              id_assignacio: parseInt(idAssignacio),
              id_alumne: idAlumne
            }
          })
        )
      )
    );

    // 2. Marcar el ítem del checklist como completado
    await prisma.checklistAssignacio.updateMany({
      where: {
        id_assignacio: parseInt(idAssignacio as string),
        pas_nom: { contains: 'Registro Nominal' }
      },
      data: {
        completat: true,
        data_completat: new Date()
      }
    });

    res.json({ message: 'Registro nominal completado', count: inscripcions.length });
  } catch (error) {
    console.error("Error al realizar registro nominal:", error);
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

// --- PHASE 3: SESSIONS & ATTENDANCE ---

/**
 * Helper to get next 10 working days (Mon-Fri)
 */
const getNextWorkingDays = (startDate: Date, count: number): Date[] => {
  const dates: Date[] = [];
  let current = new Date(startDate);
  while (dates.length < count) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

/**
 * GET: 10 sessions for an assignment
 */
export const getSessions = async (req: Request, res: Response) => {
  const { idAssignacio } = req.params;
  try {
    const assignacio = await prisma.assignacio.findUnique({
      where: { id_assignacio: parseInt(idAssignacio as string) }
    });

    if (!assignacio || !assignacio.data_inici) {
      return res.status(404).json({ error: 'Asignación no encontrada o sin fecha de inicio.' });
    }

    const sessions = getNextWorkingDays(assignacio.data_inici, 10);
    res.json(sessions.map((date, index) => ({
      numero: index + 1,
      data: date
    })));
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular sesiones' });
  }
};

/**
 * GET: Attendance list for a specific session
 */
export const getSessionAttendance = async (req: Request, res: Response) => {
  const { idAssignacio, sessionNum } = req.params;
  try {
    const inscripcions = await prisma.inscripcio.findMany({
      where: { id_assignacio: parseInt(idAssignacio as string) },
      include: {
        alumne: true,
        assistencia: {
          where: { numero_sessio: parseInt(sessionNum as string) }
        }
      }
    });

    const result = inscripcions.map(ins => ({
      id_inscripcio: ins.id_inscripcio,
      alumne: ins.alumne,
      asistencia: ins.assistencia[0] || null
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener asistencia de la sesión' });
  }
};

/**
 * POST: Register bulk attendance for a session
 */
export const registerAttendance = async (req: Request, res: Response) => {
  const { idAssignacio, sessionNum } = req.params;
  const { data_sessio, assistencies } = req.body;

  try {
    const results = await Promise.all(
      assistencies.map(async (ast: any) => {
        const existing = await prisma.assistencia.findFirst({
          where: {
            id_inscripcio: ast.id_inscripcio,
            numero_sessio: parseInt(sessionNum as string)
          }
        });

        if (existing) {
          return prisma.assistencia.update({
            where: { id_assistencia: existing.id_assistencia },
            data: {
              estat: ast.estat,
              observacions: ast.observacions,
              data_sessio: new Date(data_sessio)
            }
          });
        } else {
          return prisma.assistencia.create({
            data: {
              id_inscripcio: ast.id_inscripcio,
              numero_sessio: parseInt(sessionNum as string),
              data_sessio: new Date(data_sessio),
              estat: ast.estat,
              observacions: ast.observacions
            }
          });
        }
      })
    );

    res.json({ message: 'Asistencia registrada con éxito', count: results.length });
  } catch (error) {
    console.error("Error al registrar asistencia:", error);
    res.status(500).json({ error: 'Error al registrar la asistencia.' });
  }
};

// --- PHASE 4: CLOSING ---

/**
 * POST: Close assignment
 */
export const closeAssignacio = async (req: Request, res: Response) => {
  const { idAssignacio } = req.params;
  try {
    const updated = await prisma.assignacio.update({
      where: { id_assignacio: parseInt(idAssignacio as string) },
      data: { estat: 'Finalitzada' }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al finalizar la asignación' });
  }
};
