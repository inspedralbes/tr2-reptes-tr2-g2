"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarEvents = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const shared_1 = require("@iter/shared");
const getCalendarEvents = async (req, res) => {
    const { user } = req;
    const { start, end } = req.query;
    // Filtros de fecha opcionales pero recomendados para escalabilidad
    const dateFilter = start && end ? {
        data: {
            gte: new Date(start),
            lte: new Date(end),
        }
    } : {};
    const assignmentDateFilter = start && end ? {
        OR: [
            { data_inici: { gte: new Date(start), lte: new Date(end) } },
            { data_fi: { gte: new Date(start), lte: new Date(end) } },
        ]
    } : {};
    // Ejecutamos consultas en paralelo para mejorar rendimiento
    const [dbEvents, assignments, petitions] = await Promise.all([
        // 1. Milestones
        prisma_1.default.calendariEvent.findMany({
            where: dateFilter,
            include: { fase: true }
        }),
        // 2. Assignments (basado en rol)
        user.role === shared_1.ROLES.ADMIN
            ? prisma_1.default.assignacio.findMany({ where: assignmentDateFilter, include: { taller: true, centre: true } })
            : user.role === shared_1.ROLES.COORDINADOR
                ? prisma_1.default.assignacio.findMany({ where: { ...assignmentDateFilter, id_centre: user.centreId }, include: { taller: true } })
                : user.role === shared_1.ROLES.PROFESOR
                    ? prisma_1.default.assignacio.findMany({
                        where: { ...assignmentDateFilter, professors: { some: { id_usuari: user.userId } } },
                        include: { taller: true, centre: true }
                    })
                    : Promise.resolve([]),
        // 3. Petitions (Solo Admin y Coordinador)
        (user.role === shared_1.ROLES.ADMIN || user.role === shared_1.ROLES.COORDINADOR)
            ? prisma_1.default.peticio.findMany({
                where: {
                    ...(user.role === shared_1.ROLES.COORDINADOR ? { id_centre: user.centreId } : {}),
                    ...(user.role === shared_1.ROLES.ADMIN ? { estat: 'Pendent' } : {}),
                    data_peticio: start && end ? { gte: new Date(start), lte: new Date(end) } : undefined
                },
                include: { taller: true, centre: true }
            })
            : Promise.resolve([])
    ]);
    const events = [];
    // Mapeo de Milestones
    dbEvents.forEach((e) => {
        events.push({
            id: `milestone-${e.id_event}`,
            title: e.titol,
            date: e.data.toISOString(),
            type: e.tipus,
            description: e.descripcio || '',
            metadata: { fase: e.fase.nom }
        });
    });
    // Mapeo de Assignments
    assignments.forEach((a) => {
        if (a.data_inici) {
            events.push({
                id: `assign-${a.id_assignacio}`,
                title: user.role === shared_1.ROLES.COORDINADOR ? `Taller: ${a.taller.titol}` : `${a.taller.titol} @ ${a.centre.nom}`,
                date: a.data_inici.toISOString(),
                endDate: a.data_fi?.toISOString(),
                type: 'assignment',
                metadata: { id_assignacio: a.id_assignacio }
            });
        }
    });
    // Mapeo de Petitions
    petitions.forEach((p) => {
        events.push({
            id: `peticio-${p.id_peticio}`,
            title: user.role === shared_1.ROLES.ADMIN ? `Pendent: ${p.taller.titol} (${p.centre.nom})` : `Sol·licitud: ${p.taller.titol}`,
            date: p.data_peticio.toISOString(),
            type: 'deadline',
            description: user.role === shared_1.ROLES.ADMIN ? 'Sol·licitud de taller pendent de validació.' : `Estat: ${p.estat}`
        });
    });
    res.json(events);
};
exports.getCalendarEvents = getCalendarEvents;
