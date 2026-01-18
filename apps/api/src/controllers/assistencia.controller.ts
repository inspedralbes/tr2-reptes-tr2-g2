import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { isPhaseActive, PHASES } from '../lib/phaseUtils';

/**
 * Registra o actualiza la asistencia de un alumno en una sesión.
 */
export const registerAssistencia = async (req: Request, res: Response) => {
  const { id_inscripcio, numero_sessio, data_sessio, estat, observacions } = req.body;

  try {
    // 1. Verificar si la fase de ejecución está activa
    const phaseStatus = await isPhaseActive(PHASES.EJECUCION);
    if (!phaseStatus.isActive) {
      return res.status(403).json({ error: 'El període d\'execució i seguiment no està actiu.' });
    }

    // 2. Registrar asistencia
    const assistencia = await prisma.assistencia.upsert({
      where: {
        // Asumiendo que tenemos un índice único o buscamos por inscripción y sesión
        id_assistencia: -1 // Truco para create si no hay ID único compuesto definido en schema
      },
      update: {
        estat,
        observacions
      },
      create: {
        id_inscripcio,
        numero_sessio,
        data_sessio: new Date(data_sessio),
        estat,
        observacions
      }
    }).catch(async () => {
        // Si falla por el ID -1, buscamos si existe para esa sesión e inscripción
        const existing = await prisma.assistencia.findFirst({
            where: { id_inscripcio, numero_sessio }
        });

        if (existing) {
            return prisma.assistencia.update({
                where: { id_assistencia: existing.id_assistencia },
                data: { estat, observacions, data_sessio: new Date(data_sessio) }
            });
        } else {
            return prisma.assistencia.create({
                data: { id_inscripcio, numero_sessio, data_sessio: new Date(data_sessio), estat, observacions }
            });
        }
    });

    res.json(assistencia);
  } catch (error) {
    console.error("Error en assistencia.controller.registerAssistencia:", error);
    res.status(500).json({ error: 'Error al registrar l\'assistència.' });
  }
};

/**
 * Obtiene la asistencia de una asignación completa.
 */
export const getAssistenciaByAssignacio = async (req: Request, res: Response) => {
  const { idAssignacio } = req.params;

  try {
    const assistencies = await prisma.assistencia.findMany({
      where: {
        inscripcio: {
          id_assignacio: parseInt(idAssignacio as string)
        }
      },
      include: {
        inscripcio: {
          include: {
            alumne: true
          }
        }
      }
    });

    res.json(assistencies);
  } catch (error) {
    console.error("Error en assistencia.controller.getAssistenciaByAssignacio:", error);
    res.status(500).json({ error: 'Error al carregar l\'assistència.' });
  }
};
