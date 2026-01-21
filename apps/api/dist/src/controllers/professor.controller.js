"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProfessor = exports.updateProfessor = exports.createProfessor = exports.getProfessors = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getProfessors = async (req, res) => {
    const { centreId, role } = req.user || {};
    try {
        const where = {};
        if (role === 'COORDINADOR' && centreId) {
            where.id_centre = parseInt(centreId);
        }
        const professors = await prisma_1.default.professor.findMany({
            where,
            include: { centre: true }
        });
        res.json(professors);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener profesores' });
    }
};
exports.getProfessors = getProfessors;
const createProfessor = async (req, res) => {
    const { centreId } = req.user;
    try {
        const professor = await prisma_1.default.professor.create({
            data: {
                ...req.body,
                id_centre: centreId ? parseInt(centreId) : req.body.id_centre
            }
        });
        res.json(professor);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear profesor' });
    }
};
exports.createProfessor = createProfessor;
const updateProfessor = async (req, res) => {
    const { id } = req.params;
    try {
        const professor = await prisma_1.default.professor.update({
            where: { id_professor: parseInt(id) },
            data: req.body
        });
        res.json(professor);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar profesor' });
    }
};
exports.updateProfessor = updateProfessor;
const deleteProfessor = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.default.professor.delete({
            where: { id_professor: parseInt(id) }
        });
        res.json({ message: 'Profesor eliminado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar profesor' });
    }
};
exports.deleteProfessor = deleteProfessor;
