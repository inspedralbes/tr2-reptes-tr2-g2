"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAlumne = exports.updateAlumne = exports.createAlumne = exports.getAlumnes = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getAlumnes = async (req, res) => {
    const { centreId, role } = req.user || {};
    try {
        const where = {};
        if (role === 'COORDINADOR' && centreId) {
            where.id_centre_procedencia = parseInt(centreId);
        }
        const alumnes = await prisma_1.default.alumne.findMany({
            where,
            include: { centre_procedencia: true }
        });
        res.json(alumnes);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener alumnos' });
    }
};
exports.getAlumnes = getAlumnes;
const createAlumne = async (req, res) => {
    const { centreId } = req.user;
    try {
        const alumne = await prisma_1.default.alumne.create({
            data: {
                ...req.body,
                id_centre_procedencia: centreId ? parseInt(centreId) : req.body.id_centre_procedencia
            }
        });
        res.json(alumne);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear alumno' });
    }
};
exports.createAlumne = createAlumne;
const updateAlumne = async (req, res) => {
    const { id } = req.params;
    try {
        const alumne = await prisma_1.default.alumne.update({
            where: { id_alumne: parseInt(id) },
            data: req.body
        });
        res.json(alumne);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar alumno' });
    }
};
exports.updateAlumne = updateAlumne;
const deleteAlumne = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.default.alumne.delete({
            where: { id_alumne: parseInt(id) }
        });
        res.json({ message: 'Alumno eliminado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar alumno' });
    }
};
exports.deleteAlumne = deleteAlumne;
