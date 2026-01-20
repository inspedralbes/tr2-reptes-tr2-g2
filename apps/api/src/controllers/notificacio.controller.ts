import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import { connectToDatabase } from '../lib/mongodb';

// GET: Ver notificaciones (Filtradas por centro o usuario)
export const getNotificacions = async (req: Request, res: Response) => {
  const { centreId, userId } = (req as any).user || {};
  console.log(`🔍 Buscando notificaciones para userId: ${userId}, centreId: ${centreId}`);
  
  try {
    const where: any = { OR: [] };
    if (userId) where.OR.push({ id_usuari: userId });
    if (centreId) where.OR.push({ id_centre: centreId });

    // Si no hay filtros, no devolvemos nada o devolvemos error 400
    if (where.OR.length === 0) {
      return res.json([]);
    }

    const notificacions = await prisma.notificacio.findMany({
      where,
      orderBy: {
        data_creacio: 'desc'
      },
      take: 50
    });

    res.json(notificacions);
  } catch (error) {
    console.error("Error en notificacioController.getNotificacions:", error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

// PATCH: Marcar como leída
export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const updated = await prisma.notificacio.update({
      where: { id_notificacio: parseInt(id as string) },
      data: { llegida: true }
    });
    
    res.json(updated);
  } catch (error) {
    console.error("Error en notificacioController.markAsRead:", error);
    res.status(500).json({ error: 'Error al marcar la notificación como leída' });
  }
};

// DELETE: Eliminar notificación
export const deleteNotificacio = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    await prisma.notificacio.delete({
      where: { id_notificacio: parseInt(id as string) }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error en notificacioController.deleteNotificacio:", error);
    res.status(500).json({ error: 'Error al eliminar la notificación' });
  }
};

// Helper: Crear notificación interna (Se usará desde otros controladores)
export const createNotificacioInterna = async (data: {
  id_usuari?: number;
  id_centre?: number;
  titol: string;
  missatge: string;
  tipus: 'PETICIO' | 'FASE' | 'SISTEMA';
  importancia?: 'INFO' | 'WARNING' | 'URGENT';
}) => {
  try {
    const notif = await prisma.notificacio.create({
      data: {
        id_usuari: data.id_usuari,
        id_centre: data.id_centre,
        titol: data.titol,
        missatge: data.missatge,
        tipus: data.tipus,
        importancia: data.importancia || 'INFO'
      }
    });

    // Auditoría en MongoDB
    try {
      const { db } = await connectToDatabase();
      await db.collection('notification_audit').insertOne({
        ...notif,
        timestamp: new Date()
      });
    } catch (mongoError) {
      console.warn('⚠️ MongoDB: No se pudo auditar la notificación:', mongoError);
    }

    return notif;
  } catch (error) {
    console.error("Error creando notificación interna:", error);
  }
};
