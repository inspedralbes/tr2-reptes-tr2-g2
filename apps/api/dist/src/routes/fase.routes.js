"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const prisma_1 = __importDefault(require("../lib/prisma"));
const notificacio_controller_1 = require("../controllers/notificacio.controller");
const router = (0, express_1.Router)();
// Get all phases with their status
router.get('/', authMiddleware_1.authenticateToken, async (_req, res) => {
    const phases = await prisma_1.default.fase.findMany({
        orderBy: { ordre: 'asc' },
        include: {
            _count: {
                select: { events: true }
            }
        }
    });
    // Return consistent structure
    res.json({
        data: phases,
        meta: {
            total: phases.length,
            page: 1,
            limit: phases.length,
            totalPages: 1
        }
    });
});
// Update a specific phase (Admin only)
router.put('/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { data_inici, data_fi, activa, nom, descripcio } = req.body;
    const { user } = req;
    if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Accés denegat: Només els administradors poden modificar les fases.' });
    }
    const updatedFase = await prisma_1.default.fase.update({
        where: { id_fase: parseInt(id) },
        data: {
            nom,
            descripcio,
            data_inici: data_inici ? new Date(data_inici) : undefined,
            data_fi: data_fi ? new Date(data_fi) : undefined,
            activa: activa !== undefined ? activa : undefined
        }
    });
    if (activa === true) {
        await prisma_1.default.fase.updateMany({
            where: { id_fase: { not: parseInt(id) } },
            data: { activa: false }
        });
        // Notificar a todos los centros del inicio de la nueva fase
        await (0, notificacio_controller_1.createNotificacioInterna)({
            titol: `Nova Fase: ${updatedFase.nom}`,
            missatge: `S'ha iniciat la fase de "${updatedFase.nom}". Consulta el calendari per a més detalls.`,
            tipus: 'FASE',
            importancia: 'URGENT'
        });
    }
    res.json(updatedFase);
});
exports.default = router;
