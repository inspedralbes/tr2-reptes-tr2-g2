import { Request, Response } from 'express';
import { connectToDatabase } from '../lib/mongodb';

/**
 * GET /stats/peticions-by-status
 * REQUISITO: Agregació amb pipeline ($match, $group, $sort)
 */
export const getStatsByStatus = async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    const stats = await db.collection('request_checklists').aggregate([
      // En un caso real podríamos filtrar por fecha con $match
      {
        $group: {
          _id: "$status",
          total: { $sum: 1 },
          last_update: { $max: "$metadata.created_at" }
        }
      },
      {
        $project: {
          estat: {
            $switch: {
              branches: [
                { case: { $eq: [{ $toLower: "$_id" }, "initializing"] }, then: "pendent" },
                { case: { $eq: [{ $toLower: "$_id" }, "pendent"] }, then: "pendent" },
                { case: { $eq: [{ $toLower: "$_id" }, "aprovada"] }, then: "aprovada" },
                { case: { $eq: [{ $toLower: "$_id" }, "rebutjada"] }, then: "rebutjada" }
              ],
              default: { $toLower: "$_id" }
            }
          },
          total: 1,
          last_update: 1,
          _id: 0
        }
      },
      {
        $sort: { total: -1 }
      }
    ]).toArray();

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas de estados' });
  }
};

/**
 * GET /stats/popular-workshops
 * REQUISITO: Agregació tallers més demandats
 */
export const getPopularWorkshops = async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    const stats = await db.collection('activity_logs').aggregate([
      {
        $match: { tipus_accio: 'CREATE_PETICIO' }
      },
      {
        $group: {
          _id: { $ifNull: ["$workshop_title", { $concat: ["Taller ", { $toString: "$taller_id" }] }] },
          total_solicitudes: { $sum: 1 },
          alumnes_totals: { $sum: "$detalls.alumnes_aprox" }
        }
      },
      {
        $sort: { total_solicitudes: -1 }
      },
      {
        $limit: 5
      }
    ]).toArray();

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener talleres populares' });
  }
};

/**
 * GET /stats/recent-activity
 * REQUISITO: Consulta avançada sobre camp imbricat
 */
export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    // Buscar actividades que tengan una modalidad específica en el objeto imbricado 'detalls'
    const activity = await db.collection('activity_logs').find({
      "detalls.alumnes_aprox": { $gt: 0 }
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener actividad reciente' });
  }
};

/**
 * GET /stats/advanced-search
 * REQUISITO: Operadors de consulta ($and, $or, $in)
 */
export const getAdvancedSearch = async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { term, types } = req.query;

    const query: any = {
      $and: [
        {
          $or: [
            { workshop_title: { $regex: term || '', $options: 'i' } },
            { status: term }
          ]
        }
      ]
    };

    if (types) {
      const typeList = typeof types === 'string' ? types.split(',') : (types as string[]);
      query.$and.push({ status: { $in: typeList } });
    }

    const results = await db.collection('request_checklists').find(query).toArray();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error en búsqueda avanzada' });
  }
};

/**
 * GET /stats/query-by-step
 * REQUISITO: Consultas sobre arrays ($elemMatch)
 */
export const queryByStep = async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    // Buscar checklists que tengan un paso específico completado
    const results = await db.collection('request_checklists').find({
      passos: {
        $elemMatch: { pas: "Confirmació de dates", completat: true }
      }
    }).toArray();

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error en consulta elemMatch' });
  }
};

/**
 * PATCH /stats/checklist/:id/step
 * REQUISITO: Actualizaciones con operadores ($set, $push)
 */
export const addChecklistStep = async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;
    const { pas_nom } = req.body;

    const result = await db.collection('request_checklists').updateOne(
      { id_peticio: parseInt(id as string) },
      {
        $push: {
          passos: { pas: pas_nom, completat: false, data: new Date() }
        } as any,
        $set: { last_modified: new Date() }
      }
    );

    res.json({ success: true, modified: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar checklist' });
  }
};

/**
 * DELETE /stats/logs/cleanup
 * REQUISITO: Eliminacions con verificaciones
 */
export const cleanupLogs = async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    // Primero verificamos cuántos hay (verificación previa)
    const countBefore = await db.collection('activity_logs').countDocuments({
      timestamp: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Más viejos de 30 días
    });

    if (countBefore === 0) {
      return res.json({ message: 'No hay logs antiguos para limpiar' });
    }

    const result = await db.collection('activity_logs').deleteMany({
      timestamp: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Se han limpiado ${result.deletedCount} logs antiguos.`
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al limpiar logs' });
  }
};

/**
 * PATCH /stats/workshop/:id/book
 * REQUISITO: Operacions atòmiques amb $inc e impedició de race conditions
 */
export const bookWorkshopPlace = async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;

    // Actualización atómica con verificación: solo si hay plazas disponibles
    const result = await db.collection('workshop_metadata').updateOne(
      {
        id_taller: parseInt(id as string),
        $expr: { $lt: ["$places_ocupades", "$places_totals"] } // Evita race condition
      },
      {
        $inc: { places_ocupades: 1 } // Operación atómica
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: 'No hi ha places disponibles o el taller no existeix' });
    }

    res.json({ success: true, message: 'Plaça reservada amb èxit' });
  } catch (error) {
    res.status(500).json({ error: 'Error en la reserva atòmica' });
  }
};

/**
 * GET /stats/occupancy-by-zone
 * REQUISITO: Estadístiques d'ocupació per zones (aggregation pipeline)
 */
export const getOccupancyByZone = async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    const stats = await db.collection('workshop_metadata').aggregate([
      {
        $group: {
          _id: "$zona",
          total_places: { $sum: "$places_totals" },
          total_ocupades: { $sum: "$places_ocupades" }
        }
      },
      {
        $project: {
          zona: "$_id",
          percentatge_ocupacio: {
            $multiply: [{ $divide: ["$total_ocupades", "$total_places"] }, 100]
          },
          _id: 0
        }
      },
      { $sort: { percentatge_ocupacio: -1 } }
    ]).toArray();

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular ocupació per zones' });
  }
};

// POST: Ejecutar análisis de riesgo de abandono
import { RiskAnalysisService } from '../services/risk-analysis.service';
import prisma from '../lib/prisma'; // Import prisma for this function

export const runRiskAnalysis = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.body;
    const service = new RiskAnalysisService();

    if (studentId) {
      // Analyze single student
      const result = await service.analyzeStudentRisk(parseInt(studentId));
      return res.json({ processed: 1, results: [result] });
    } else {
      // Analyze all active students (or those in Phase 3/Execution)
      // For now, let's just analyze all who have attendance records to avoid scanning thousands
      const studentsWithAttendance = await prisma.assistencia.findMany({
        select: { inscripcio: { select: { id_alumne: true } } },
        distinct: ['id_inscripcio']
      });

      const uniqueIds = [...new Set(studentsWithAttendance.map((a: any) => a.inscripcio.id_alumne))];

      const results = [];
      for (const id of uniqueIds) {
        results.push(await service.analyzeStudentRisk(Number(id)));
      }

      res.json({ processed: results.length, active_risks: results.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH') });
    }

  } catch (error) {
    console.error("Error in risk analysis:", error);
    res.status(500).json({ error: 'Error al ejecutar análisis de riesgo' });
  }
};
