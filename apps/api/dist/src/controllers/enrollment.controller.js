"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollStudentsViaExcel = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const xlsx = __importStar(require("xlsx"));
/**
 * Upload Excel and import students to an assignment
 */
const enrollStudentsViaExcel = async (req, res) => {
    const { idAssignacio } = req.params;
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'No files were uploaded.' });
    }
    try {
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        // Expecting columns: "nom", "cognoms", "idalu", "curs"
        const studentsToCreate = data.map(row => ({
            nom: row.nom || row.Nombre || '',
            cognoms: row.cognoms || row.Apellidos || '',
            idalu: String(row.idalu || row.ID || ''),
            curs: row.curs || row.Curso || ''
        })).filter(s => s.nom && s.idalu);
        const assignacio = await prisma_1.default.assignacio.findUnique({
            where: { id_assignacio: parseInt(idAssignacio) },
            include: { centre: true }
        });
        if (!assignacio) {
            return res.status(404).json({ error: 'Assignment not found.' });
        }
        const results = [];
        for (const s of studentsToCreate) {
            // Upsert student (they might already exist if they are in multiple workshops or from previous years)
            const alumne = await prisma_1.default.alumne.upsert({
                where: { idalu: s.idalu },
                update: {
                    nom: s.nom,
                    cognoms: s.cognoms,
                    curs: s.curs
                },
                create: {
                    ...s,
                    id_centre_procedencia: assignacio.id_centre
                }
            });
            // Create inscription
            const inscripcio = await prisma_1.default.inscripcio.upsert({
                where: {
                    // We don't have a unique key for inscripcio, so we manually check
                    id_inscripcio: -1 // dummy
                },
                update: {},
                create: {
                    id_assignacio: assignacio.id_assignacio,
                    id_alumne: alumne.id_alumne
                }
            }).catch(async () => {
                // Manual check for existing
                const existing = await prisma_1.default.inscripcio.findFirst({
                    where: { id_assignacio: assignacio.id_assignacio, id_alumne: alumne.id_alumne }
                });
                if (!existing) {
                    return prisma_1.default.inscripcio.create({
                        data: { id_assignacio: assignacio.id_assignacio, id_alumne: alumne.id_alumne }
                    });
                }
                return existing;
            });
            results.push(inscripcio);
        }
        // Update checklist
        await prisma_1.default.checklistAssignacio.updateMany({
            where: {
                id_assignacio: assignacio.id_assignacio,
                pas_nom: { contains: 'Registro Nominal' }
            },
            data: {
                completat: true,
                data_completat: new Date()
            }
        });
        res.json({
            message: `${results.length} students enrolled successfully.`,
            count: results.length
        });
    }
    catch (error) {
        console.error('Enrollment Error:', error);
        res.status(500).json({ error: 'Failed to process Excel file.' });
    }
};
exports.enrollStudentsViaExcel = enrollStudentsViaExcel;
