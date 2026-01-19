"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAutomaticAssignments = exports.designateProfessors = exports.createInscripcions = exports.createAssignacioFromPeticio = exports.createIncidencia = exports.getIncidenciesByCentre = exports.updateChecklistItem = exports.getChecklist = exports.getAssignacionsByCentre = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const shared_1 = require("@iter/shared");
// GET: Listar asignaciones de un centro
const getAssignacionsByCentre = async (req, res) => {
    const { idCentre } = req.params;
    try {
        const assignacions = await prisma_1.default.assignacio.findMany({
            where: { id_centre: parseInt(idCentre) },
            include: {
                taller: true,
                checklist: true,
                peticio: {
                    include: {
                        centre: true
                    }
                }
            }
        });
        res.json(assignacions);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener asignaciones' });
    }
};
exports.getAssignacionsByCentre = getAssignacionsByCentre;
// GET: Checklist de una asignación
const getChecklist = async (req, res) => {
    const { idAssignacio } = req.params;
    try {
        const checklist = await prisma_1.default.checklistAssignacio.findMany({
            where: { id_assignacio: parseInt(idAssignacio) }
        });
        res.json(checklist);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener checklist' });
    }
};
exports.getChecklist = getChecklist;
// PATCH: Actualizar ítem de checklist
const updateChecklistItem = async (req, res) => {
    const { idItem } = req.params;
    const result = shared_1.AssignmentChecklistSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: 'Datos de validación inválidos', details: result.error.format() });
    }
    const { completat, url_evidencia } = result.data;
    try {
        const updated = await prisma_1.default.checklistAssignacio.update({
            where: { id_checklist: parseInt(idItem) },
            data: {
                completat,
                url_evidencia,
                data_completat: completat ? new Date() : null
            }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar checklist' });
    }
};
exports.updateChecklistItem = updateChecklistItem;
// GET: Incidencias de un centro
const getIncidenciesByCentre = async (req, res) => {
    const { idCentre } = req.params;
    try {
        const incidencies = await prisma_1.default.incidencia.findMany({
            where: { id_centre: parseInt(idCentre) },
            orderBy: { data_creacio: 'desc' }
        });
        res.json(incidencies);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener incidencias' });
    }
};
exports.getIncidenciesByCentre = getIncidenciesByCentre;
// POST: Crear incidencia
const createIncidencia = async (req, res) => {
    const { id_centre, descripcio } = req.body;
    try {
        const nuevaIncidencia = await prisma_1.default.incidencia.create({
            data: {
                id_centre: parseInt(id_centre),
                descripcio
            }
        });
        res.status(201).json(nuevaIncidencia);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al crear incidencia' });
    }
};
exports.createIncidencia = createIncidencia;
// POST: Crear Asignación desde Petición (Admin Only)
const createAssignacioFromPeticio = async (req, res) => {
    const { idPeticio } = req.body;
    const { role } = req.user;
    if (role !== shared_1.ROLES.ADMIN) {
        return res.status(403).json({ error: 'Solo los administradores pueden realizar asignaciones.' });
    }
    try {
        const peticio = await prisma_1.default.peticio.findUnique({
            where: { id_peticio: parseInt(idPeticio) },
            include: { centre: true, taller: true }
        });
        if (!peticio) {
            return res.status(404).json({ error: 'Petición no encontrada.' });
        }
        if (peticio.estat !== 'Aprovada') {
            return res.status(400).json({ error: 'La petición debe estar aprobada para crear una asignación.' });
        }
        // Comprobar si ya existe una asignación para esta petición
        const existing = await prisma_1.default.assignacio.findUnique({
            where: { id_peticio: peticio.id_peticio }
        });
        if (existing) {
            return res.status(400).json({ error: 'Ya existe una asignación para esta petición.' });
        }
        const nuevaAssignacio = await prisma_1.default.assignacio.create({
            data: {
                id_peticio: peticio.id_peticio,
                id_centre: peticio.id_centre,
                id_taller: peticio.id_taller,
                estat: 'En_curs',
                // Inicializar checklist por defecto para Fase 2
                checklist: {
                    create: [
                        { pas_nom: 'Designar Profesores Referentes', completat: false },
                        { pas_nom: 'Subir Registro Nominal (Excel)', completat: false },
                        { pas_nom: 'Gestionar Acuerdo Pedagógico (Modalidad C)', completat: peticio.modalitat !== 'C' }
                    ]
                }
            }
        });
        res.status(201).json(nuevaAssignacio);
    }
    catch (error) {
        console.error("Error al crear asignación:", error);
        res.status(500).json({ error: 'Error al crear la asignación.' });
    }
};
exports.createAssignacioFromPeticio = createAssignacioFromPeticio;
// POST: Realizar Registro Nominal (Inscribir alumnos en una asignación)
const createInscripcions = async (req, res) => {
    const idAssignacio = req.params.idAssignacio;
    const { ids_alumnes } = req.body; // Array de IDs de alumnos
    try {
        const assignacio = await prisma_1.default.assignacio.findUnique({
            where: { id_assignacio: parseInt(idAssignacio) }
        });
        if (!assignacio) {
            return res.status(404).json({ error: 'Asignación no encontrada.' });
        }
        // 1. Crear las inscripciones
        const inscripcions = await Promise.all(ids_alumnes.map((idAlumne) => prisma_1.default.inscripcio.upsert({
            where: {
                // Necesitaríamos una clave única para inscripciones si quisiéramos upsert real,
                // pero como no hay, usaremos create o simplemente borraremos las anteriores
                id_inscripcio: -1 // Truco para forzar el fallo si no existe y crear
            },
            update: {},
            create: {
                id_assignacio: parseInt(idAssignacio),
                id_alumne: idAlumne
            }
        }).catch(() => 
        // Si falla (porque el ID -1 no existe), creamos normalmente
        prisma_1.default.inscripcio.create({
            data: {
                id_assignacio: parseInt(idAssignacio),
                id_alumne: idAlumne
            }
        }))));
        // 2. Marcar el ítem del checklist como completado
        await prisma_1.default.checklistAssignacio.updateMany({
            where: {
                id_assignacio: parseInt(idAssignacio),
                pas_nom: { contains: 'Registro Nominal' }
            },
            data: {
                completat: true,
                data_completat: new Date()
            }
        });
        res.json({ message: 'Registro nominal completado', count: inscripcions.length });
    }
    catch (error) {
        console.error("Error al realizar registro nominal:", error);
        res.status(500).json({ error: 'Error al realizar el registro nominal.' });
    }
};
exports.createInscripcions = createInscripcions;
// PATCH: Designar profesores para una asignación
const designateProfessors = async (req, res) => {
    const { idAssignacio } = req.params;
    const { prof1_id, prof2_id } = req.body;
    try {
        const updated = await prisma_1.default.assignacio.update({
            where: { id_assignacio: parseInt(idAssignacio) },
            data: {
                prof1_id,
                prof2_id
            }
        });
        // Actualizar checklist
        await prisma_1.default.checklistAssignacio.updateMany({
            where: {
                id_assignacio: parseInt(idAssignacio),
                pas_nom: { contains: 'Profesores Referentes' }
            },
            data: {
                completat: true,
                data_completat: new Date()
            }
        });
        res.json(updated);
    }
    catch (error) {
        console.error("Error al designar profesores:", error);
        res.status(500).json({ error: 'Error al designar profesores.' });
    }
};
exports.designateProfessors = designateProfessors;
// POST: Generar Asignaciones Automáticas (AI)
const auto_assignment_service_1 = require("../services/auto-assignment.service");
const generateAutomaticAssignments = async (req, res) => {
    const { role } = req.user;
    // if (role !== ROLES.ADMIN) return res.status(403).json({ error: 'No autorizado' });
    try {
        const service = new auto_assignment_service_1.AutoAssignmentService();
        const result = await service.generateAssignments();
        res.json(result);
    }
    catch (error) {
        console.error("Error en asignación automática:", error);
        res.status(500).json({ error: 'Error al ejecutar el motor de asignación.' });
    }
};
exports.generateAutomaticAssignments = generateAutomaticAssignments;
