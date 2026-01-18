import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import { AssignmentChecklistSchema } from '@iter/shared';
import { SessionService } from '../services/session.service';
import { EstatAssistencia } from '@prisma/client';

// GET: Listar asignaciones de un centro
export const getAssignacionsByCentre = async (req: Request, res: Response) => {
  const { idCentre } = req.params;
  try {
    const assignacions = await prisma.assignacio.findMany({
      where: { id_centre: parseInt(idCentre as string) },
      include: {
        taller: true,
        checklist: true,
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
    res.status(500).json({ error: 'Error al crear incidencia' });
  }
};

// ==========================================
// PHASE 3: SESSIONS & ATTENDANCE
// ==========================================

// GET: Obtain calculated sessions for an assignment
export const getSessions = async (req: Request, res: Response) => {
  const { idAssignacio } = req.params;
  try {
    const assignacio = await prisma.assignacio.findUnique({
      where: { id_assignacio: parseInt(idAssignacio as string) }
    });

    if (!assignacio || !assignacio.data_inici) {
      return res.status(404).json({ error: 'Asignación no encontrada o sin fecha de inicio' });
    }

    const dates = SessionService.generateSessionDates(new Date(assignacio.data_inici));

    // Map to simple structure with status
    const sessions = await Promise.all(dates.map(async (date, index) => {
      const sessionNum = index + 1;
      const status = await SessionService.getSessionStatus(assignacio.id_assignacio, sessionNum);
      return {
        sessionNum,
        date,
        status
      };
    }));

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al calcular sesiones' });
  }
};

// GET: Get attendees for a specific session
export const getSessionAttendance = async (req: Request, res: Response) => {
  const { idAssignacio, sessionNum } = req.params;
  const sNum = parseInt(sessionNum as string);
  const idAss = parseInt(idAssignacio as string);

  try {
    // 1. Ensure date correctness (re-calculate to be safe)
    const assignacio = await prisma.assignacio.findUnique({
      where: { id_assignacio: idAss }
    });

    if (!assignacio || !assignacio.data_inici) {
      return res.status(404).json({ error: 'Asignación inválida' });
    }

    const dates = SessionService.generateSessionDates(new Date(assignacio.data_inici));
    const sessionDate = dates[sNum - 1];

    if (!sessionDate) {
      return res.status(400).json({ error: 'Número de sesión inválido' });
    }

    // 2. Ensure records exist (Lazy initialization)
    await SessionService.ensureAttendanceRecords(idAss, sNum, sessionDate);

    // 3. Fetch records with student info
    const attendance = await prisma.assistencia.findMany({
      where: {
        inscripcio: { id_assignacio: idAss },
        numero_sessio: sNum
      },
      include: {
        inscripcio: {
          include: { alumne: true }
        }
      },
      orderBy: { inscripcio: { alumne: { cognoms: 'asc' } } }
    });

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener asistencia' });
  }
};

// POST: Update attendance for a session
export const registerAttendance = async (req: Request, res: Response) => {
  const { idAssignacio, sessionNum } = req.params;
  const { attendanceData } = req.body; // Array of { id_assistencia, estat, observacions }

  if (!Array.isArray(attendanceData)) {
    return res.status(400).json({ error: 'Formato de datos inválido' });
  }

  try {
    // Bulk update approach using transaction or Promise.all
    // Prisma doesn't support bulk update with different values easily yet, so loop is okay for small classroom sizes
    await prisma.$transaction(
      attendanceData.map((item: any) =>
        prisma.assistencia.update({
          where: { id_assistencia: item.id_assistencia },
          data: {
            estat: item.estat as EstatAssistencia,
            observacions: item.observacions
          }
        })
      )
    );

    res.json({ success: true, count: attendanceData.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar asistencia' });
  }
};
