"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSectors = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// GET: Listar todos los sectores
const getSectors = async (req, res) => {
    try {
        const sectors = await prisma_1.default.sector.findMany({
            orderBy: { nom: 'asc' }
        });
        res.json(sectors);
    }
    catch (error) {
        console.error("Error en sectorController.getSectors:", error);
        res.status(500).json({ error: 'Error al obtener los sectores' });
    }
};
exports.getSectors = getSectors;
