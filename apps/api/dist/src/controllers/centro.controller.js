"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCentre = exports.updateCentre = exports.updateCentreAttendance = exports.createCentre = exports.getCentreById = exports.getCentres = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// GET: Listar todos con paginación
const getCentres = async (req, res) => {
    const { page = 1, limit = 100 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const [centres, total] = await Promise.all([
        prisma_1.default.centre.findMany({
            skip,
            take,
        }),
        prisma_1.default.centre.count(),
    ]);
    res.json({
        data: centres,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / take),
        },
    });
};
exports.getCentres = getCentres;
// GET: Uno por ID
const getCentreById = async (req, res) => {
    const { id } = req.params;
    const centre = await prisma_1.default.centre.findUnique({
        where: { id_centre: parseInt(id) }
    });
    if (!centre)
        return res.status(404).json({ error: 'Centro no encontrado' });
    res.json(centre);
};
exports.getCentreById = getCentreById;
// POST: Crear
const createCentre = async (req, res) => {
    const newCentre = await prisma_1.default.centre.create({
        data: req.body
    });
    res.json(newCentre);
};
exports.createCentre = createCentre;
// PATCH: Marcar asistencia a la reunión
const updateCentreAttendance = async (req, res) => {
    const { id } = req.params;
    const { asistencia_reunion } = req.body;
    const updated = await prisma_1.default.centre.update({
        where: { id_centre: parseInt(id) },
        data: { asistencia_reunion }
    });
    res.json(updated);
};
exports.updateCentreAttendance = updateCentreAttendance;
// PATCH: Actualizar centro
const updateCentre = async (req, res) => {
    const { id } = req.params;
    const updated = await prisma_1.default.centre.update({
        where: { id_centre: parseInt(id) },
        data: req.body
    });
    res.json(updated);
};
exports.updateCentre = updateCentre;
// DELETE: Eliminar centro
const deleteCentre = async (req, res) => {
    const { id } = req.params;
    await prisma_1.default.centre.delete({
        where: { id_centre: parseInt(id) }
    });
    res.status(204).send();
};
exports.deleteCentre = deleteCentre;
