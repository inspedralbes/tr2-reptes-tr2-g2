"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CentreAttendanceSchema = exports.AssignmentChecklistSchema = exports.PeticioSchema = exports.esEmailValido = exports.FASES_TIMELINE = exports.PHASES = exports.CALENDARI = exports.THEME = exports.ESTADOS_PETICION = exports.ROLES = void 0;
const zod_1 = require("zod");
// Definimos los roles exactos que espera la Base de Datos
exports.ROLES = {
    ADMIN: 'ADMIN',
    COORDINADOR: 'COORDINADOR',
    PROFESOR: 'PROFESSOR'
};
// Definimos los estados de las peticiones - Alineados con Prisma Enum 'EstatPeticio'
exports.ESTADOS_PETICION = {
    PENDIENTE: 'Pendent',
    ACEPTADA: 'Aprovada',
    RECHAZADA: 'Rebutjada'
};
// Branding CEB
exports.THEME = {
    colors: {
        primary: '#00426B', // Blau fosc (Principal)
        secondary: '#4197CB', // Blau clar
        background: '#F9FAFB', // Gris molt clar
        surface: '#FFFFFF',
        text: {
            primary: '#111827',
            secondary: '#4B5563',
            muted: '#9CA3AF'
        },
        accent: '#F26178', // Rosa/Vermell
        neutral: '#CFD2D3', // Gris
        beige: '#E0C5AC'
    },
    fonts: {
        primary: 'Helvetica Neue, Arial, sans-serif'
    }
};
// Calendario Programa Iter (Curso 25-26 aprox)
exports.CALENDARI = {
    REUNION_PRESENTACION: '2025-09-30',
    LIMITE_DEMANDA: '2025-10-10',
    COMUNICACION_ASIGNACIONES: '2025-10-20',
    GESTION_VACANTES: '2025-11-01',
};
// Nombres oficiales de las fases para consistencia en DB y UI
exports.PHASES = {
    SOLICITUD: 'Solicitud e Inscripción',
    PLANIFICACION: 'Planificación y Asignación',
    EJECUCION: 'Ejecución y Seguimiento',
    CIERRE: 'Cierre y Evaluación'
};
exports.FASES_TIMELINE = [
    { id: 'PRESENTACIO', nom: exports.PHASES.SOLICITUD, data: exports.CALENDARI.REUNION_PRESENTACION },
    { id: 'DEMANDA', nom: 'Enviament de Demanda', data: exports.CALENDARI.LIMITE_DEMANDA },
    { id: 'ASSIGNACIO', nom: exports.PHASES.PLANIFICACION, data: exports.CALENDARI.COMUNICACION_ASIGNACIONES },
    { id: 'VACANTS', nom: 'Gestió de Vacants i Incidències', data: exports.CALENDARI.GESTION_VACANTES },
    { id: 'VALIDACIO', nom: exports.PHASES.CIERRE, data: null }
];
// Utility functions
const esEmailValido = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};
exports.esEmailValido = esEmailValido;
// Zod Schemas for Validation
exports.PeticioSchema = zod_1.z.object({
    id_centre: zod_1.z.number().int(),
    id_taller: zod_1.z.number().int(),
    alumnes_aprox: zod_1.z.number().int().min(1).max(100),
    comentaris: zod_1.z.string().optional()
});
exports.AssignmentChecklistSchema = zod_1.z.object({
    id_checklist: zod_1.z.number().int(),
    completat: zod_1.z.boolean(),
    url_evidencia: zod_1.z.string().url().optional().or(zod_1.z.literal(''))
});
exports.CentreAttendanceSchema = zod_1.z.object({
    id_centre: zod_1.z.number().int(),
    asistencia_reunion: zod_1.z.boolean()
});
