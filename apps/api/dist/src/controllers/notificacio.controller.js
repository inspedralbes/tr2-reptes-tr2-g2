"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificacioInterna = exports.deleteNotificacio = exports.markAsRead = exports.getNotificacions = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const mongodb_1 = require("../lib/mongodb");
// GET: Ver notificaciones (Filtradas por centro o usuario)
const getNotificacions = async (req, res) => {
    const { centreId, userId } = req.user || {};
    console.log(`🔍 Buscando notificaciones para userId: ${userId}, centreId: ${centreId}`);
    try {
        const where = { OR: [] };
        if (userId)
            where.OR.push({ id_usuari: userId });
        if (centreId)
            where.OR.push({ id_centre: centreId });
        // Si no hay filtros, no devolvemos nada o devolvemos error 400
        if (where.OR.length === 0) {
            return res.json([]);
        }
        const notificacions = await prisma_1.default.notificacio.findMany({
            where,
            orderBy: {
                data_creacio: 'desc'
            },
            take: 50
        });
        res.json(notificacions);
    }
    catch (error) {
        console.error("Error en notificacioController.getNotificacions:", error);
        res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
};
exports.getNotificacions = getNotificacions;
// PATCH: Marcar como leída
const markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await prisma_1.default.notificacio.update({
            where: { id_notificacio: parseInt(id) },
            data: { llegida: true }
        });
        res.json(updated);
    }
    catch (error) {
        console.error("Error en notificacioController.markAsRead:", error);
        res.status(500).json({ error: 'Error al marcar la notificación como leída' });
    }
};
exports.markAsRead = markAsRead;
// DELETE: Eliminar notificación
const deleteNotificacio = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.default.notificacio.delete({
            where: { id_notificacio: parseInt(id) }
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error("Error en notificacioController.deleteNotificacio:", error);
        res.status(500).json({ error: 'Error al eliminar la notificación' });
    }
};
exports.deleteNotificacio = deleteNotificacio;
// Helper: Crear notificación interna (Se usará desde otros controladores)
const createNotificacioInterna = async (data) => {
    try {
        const notif = await prisma_1.default.notificacio.create({
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
            const { db } = await (0, mongodb_1.connectToDatabase)();
            await db.collection('notification_audit').insertOne({
                ...notif,
                timestamp: new Date()
            });
        }
        catch (mongoError) {
            console.warn('⚠️ MongoDB: No se pudo auditar la notificación:', mongoError);
        }
        return notif;
    }
    catch (error) {
        console.error("Error creando notificación interna:", error);
    }
};
exports.createNotificacioInterna = createNotificacioInterna;
