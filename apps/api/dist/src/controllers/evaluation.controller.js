"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVoiceEvaluation = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const nlp_service_1 = require("../services/nlp.service");
const processVoiceEvaluation = async (req, res) => {
    const { text, studentId, sessionId, assignacioId } = req.body;
    if (!text || !studentId || !sessionId) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos (text, studentId, sessionId).' });
    }
    try {
        const nlpService = new nlp_service_1.NLPService();
        const result = nlpService.processText(text);
        // 1. Update/Create Assistencia
        // We need to find the Inscripcio first
        const inscripcio = await prisma_1.default.inscripcio.findFirst({
            where: {
                id_alumne: parseInt(studentId),
                id_assignacio: parseInt(assignacioId) // Optional if we just query by student, but safer with session context
            }
        });
        let assistencia = null;
        if (inscripcio) {
            // Upsert Assistencia
            // Since the schema might not have a unique compound constraint on (inscripcio, sessio),
            // we use findFirst -> update/create pattern or just create.
            // For this prototype, let's assume valid data.
            const existingAssistencia = await prisma_1.default.assistencia.findFirst({
                where: {
                    id_inscripcio: inscripcio.id_inscripcio,
                    numero_sessio: parseInt(sessionId)
                }
            });
            const dataToSave = {
                id_inscripcio: inscripcio.id_inscripcio,
                numero_sessio: parseInt(sessionId),
                data_sessio: new Date(), // Today
                estat: result.attendanceStatus || (existingAssistencia ? existingAssistencia.estat : 'Present'),
                observacions: text // We save the full text
            };
            if (existingAssistencia) {
                assistencia = await prisma_1.default.assistencia.update({
                    where: { id_assistencia: existingAssistencia.id_assistencia },
                    data: {
                        estat: dataToSave.estat,
                        observacions: dataToSave.observacions,
                        data_sessio: new Date()
                    }
                });
            }
            else {
                assistencia = await prisma_1.default.assistencia.create({
                    data: {
                        ...dataToSave,
                        estat: dataToSave.estat // Ensure valid enum
                    } // TS Enum casting might be needed
                });
            }
        }
        // 2. Update Competence (if detected)
        let competenceEvaluation = null;
        if (result.competenceUpdate && inscripcio) {
            // Find 'Transversal' competence or specific one. 
            // We'll pick the first transversal one for demo purposes.
            const competencia = await prisma_1.default.competencia.findFirst({
                where: { tipus: 'Transversal' }
            });
            if (competencia) {
                competenceEvaluation = await prisma_1.default.avaluacioCompetencial.create({
                    data: {
                        id_inscripcio: inscripcio.id_inscripcio,
                        id_competencia: competencia.id_competencia,
                        puntuacio: result.competenceUpdate.score
                    }
                });
            }
        }
        res.json({
            originalText: text,
            analysis: result,
            updates: {
                assistencia,
                competenceEvaluation
            }
        });
    }
    catch (error) {
        console.error("Error processing voice evaluation:", error);
        res.status(500).json({ error: 'Error al procesar la evaluación de voz.' });
    }
};
exports.processVoiceEvaluation = processVoiceEvaluation;
