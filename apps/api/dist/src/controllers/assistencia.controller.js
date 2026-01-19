"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssistenciaByAssignacio = exports.registerAssistencia = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const phaseUtils_1 = require("../lib/phaseUtils");
/**
 * Registra o actualiza la asistencia de un alumno en una sesión.
 */
const registerAssistencia = async (req, res) => {
    const { id_inscripcio, numero_sessio, data_sessio, estat, observacions } = req.body;
    try {
        // 1. Verificar si la fase de ejecución está activa
        const phaseStatus = await (0, phaseUtils_1.isPhaseActive)(phaseUtils_1.PHASES.EJECUCION);
        if (!phaseStatus.isActive) {
            return res.status(403).json({ error: 'El període d\'execució i seguiment no està actiu.' });
        }
        // 2. Registrar asistencia
        const assistencia = await prisma_1.default.assistencia.upsert({
            where: {
                // Asumiendo que tenemos un índice único o buscamos por inscripción y sesión
                id_assistencia: -1 // Truco para create si no hay ID único compuesto definido en schema
            },
            update: {
                estat,
                observacions
            },
            create: {
                id_inscripcio,
                numero_sessio,
                data_sessio: new Date(data_sessio),
                estat,
                observacions
            }
        }).catch(async () => {
            // Si falla por el ID -1, buscamos si existe para esa sesión e inscripción
            const existing = await prisma_1.default.assistencia.findFirst({
                where: { id_inscripcio, numero_sessio }
            });
            if (existing) {
                return prisma_1.default.assistencia.update({
                    where: { id_assistencia: existing.id_assistencia },
                    data: { estat, observacions, data_sessio: new Date(data_sessio) }
                });
            }
            else {
                return prisma_1.default.assistencia.create({
                    data: { id_inscripcio, numero_sessio, data_sessio: new Date(data_sessio), estat, observacions }
                });
            }
        });
        res.json(assistencia);
    }
    catch (error) {
        console.error("Error en assistencia.controller.registerAssistencia:", error);
        res.status(500).json({ error: 'Error al registrar l\'assistència.' });
    }
};
exports.registerAssistencia = registerAssistencia;
/**
 * Obtiene la asistencia de una asignación completa.
 */
const getAssistenciaByAssignacio = async (req, res) => {
    const { idAssignacio } = req.params;
    try {
        const assistencies = await prisma_1.default.assistencia.findMany({
            where: {
                inscripcio: {
                    id_assignacio: parseInt(idAssignacio)
                }
            },
            include: {
                inscripcio: {
                    include: {
                        alumne: true
                    }
                }
            }
        });
        res.json(assistencies);
    }
    catch (error) {
        console.error("Error en assistencia.controller.getAssistenciaByAssignacio:", error);
        res.status(500).json({ error: 'Error al carregar l\'assistència.' });
    }
};
exports.getAssistenciaByAssignacio = getAssistenciaByAssignacio;
