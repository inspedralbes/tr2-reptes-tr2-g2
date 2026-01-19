"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTaller = exports.updateTaller = exports.createTaller = exports.getTallerById = exports.getTallers = void 0;
// apps/api/src/controllers/taller.controller.ts
const prisma_1 = __importDefault(require("../lib/prisma")); // Importamos nuestro cliente singleton
// GET: Listar todos los talleres con paginación
const getTallers = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const [tallers, total] = await Promise.all([
        prisma_1.default.taller.findMany({
            skip,
            take,
            include: {
                sector: true,
            },
        }),
        prisma_1.default.taller.count(),
    ]);
    res.json({
        data: tallers,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / take),
        },
    });
};
exports.getTallers = getTallers;
// GET: Detalle de un taller
const getTallerById = async (req, res) => {
    const { id } = req.params;
    const taller = await prisma_1.default.taller.findUnique({
        where: { id_taller: parseInt(id) },
        include: {
            sector: true,
        },
    });
    if (!taller)
        return res.status(404).json({ error: 'Taller no encontrado' });
    res.json(taller);
};
exports.getTallerById = getTallerById;
// POST: Crear Taller
const createTaller = async (req, res) => {
    const { titol, descripcio, durada_h, places_maximes, modalitat, id_sector } = req.body;
    try {
        const nuevoTaller = await prisma_1.default.taller.create({
            data: {
                titol,
                descripcio_curta: descripcio || "",
                durada_h: typeof durada_h === 'string' ? parseInt(durada_h) : (durada_h || 0),
                places_maximes: typeof places_maximes === 'string' ? parseInt(places_maximes) : (places_maximes || 25),
                modalitat: modalitat || 'A',
                id_sector: id_sector ? (typeof id_sector === 'string' ? parseInt(id_sector) : id_sector) : 1
            },
        });
        res.status(201).json(nuevoTaller);
    }
    catch (error) {
        console.error("Error en createTaller:", error);
        res.status(500).json({ error: 'Error al crear el taller' });
    }
};
exports.createTaller = createTaller;
// PUT: Actualizar
const updateTaller = async (req, res) => {
    const { id } = req.params;
    const { titol, descripcio, durada_h, places_maximes, modalitat, id_sector } = req.body;
    try {
        const updateData = {};
        if (titol !== undefined)
            updateData.titol = titol;
        if (descripcio !== undefined)
            updateData.descripcio_curta = descripcio;
        if (durada_h !== undefined)
            updateData.durada_h = typeof durada_h === 'string' ? parseInt(durada_h) : durada_h;
        if (places_maximes !== undefined)
            updateData.places_maximes = typeof places_maximes === 'string' ? parseInt(places_maximes) : places_maximes;
        if (modalitat !== undefined)
            updateData.modalitat = modalitat;
        if (id_sector !== undefined)
            updateData.id_sector = typeof id_sector === 'string' ? parseInt(id_sector) : id_sector;
        const tallerActualizado = await prisma_1.default.taller.update({
            where: { id_taller: parseInt(id) },
            data: updateData,
        });
        res.json(tallerActualizado);
    }
    catch (error) {
        console.error("Error en updateTaller:", error);
        res.status(500).json({ error: 'Error al actualizar el taller' });
    }
};
exports.updateTaller = updateTaller;
// DELETE: Borrar
const deleteTaller = async (req, res) => {
    const { id } = req.params;
    await prisma_1.default.taller.delete({
        where: { id_taller: parseInt(id) },
    });
    res.json({ message: 'Taller eliminado correctamente' });
};
exports.deleteTaller = deleteTaller;
