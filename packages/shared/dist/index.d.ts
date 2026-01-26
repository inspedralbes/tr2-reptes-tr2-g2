import { z } from 'zod';
import { THEME } from './theme';
export { THEME };
export declare const ROLES: {
    readonly ADMIN: "ADMIN";
    readonly COORDINADOR: "COORDINADOR";
    readonly PROFESOR: "PROFESSOR";
};
export type Rol = typeof ROLES[keyof typeof ROLES];
export declare const ESTADOS_PETICION: {
    readonly PENDIENTE: "Pendent";
    readonly ACEPTADA: "Aprovada";
    readonly RECHAZADA: "Rebutjada";
};
export type EstadoPeticion = typeof ESTADOS_PETICION[keyof typeof ESTADOS_PETICION];
export declare const CALENDARI: {
    readonly REUNION_PRESENTACION: "2025-09-30";
    readonly LIMITE_DEMANDA: "2025-10-10";
    readonly COMUNICACION_ASIGNACIONES: "2025-10-20";
    readonly GESTION_VACANTES: "2025-11-01";
};
export declare const PHASES: {
    readonly SOLICITUD: "Sol·licitud i Inscripció";
    readonly PLANIFICACION: "Planificació i Assignació";
    readonly EJECUCION: "Execució i Seguiment";
    readonly CIERRE: "Tancament i Avaluació";
};
export declare const FASES_TIMELINE: readonly [{
    readonly id: "PRESENTACIO";
    readonly nom: "Sol·licitud i Inscripció";
    readonly data: "2025-09-30";
}, {
    readonly id: "DEMANDA";
    readonly nom: "Enviament de Demanda";
    readonly data: "2025-10-10";
}, {
    readonly id: "ASSIGNACIO";
    readonly nom: "Planificació i Assignació";
    readonly data: "2025-10-20";
}, {
    readonly id: "VACANTS";
    readonly nom: "Gestió de Vacants i Incidències";
    readonly data: "2025-11-01";
}, {
    readonly id: "VALIDACIO";
    readonly nom: "Tancament i Avaluació";
    readonly data: null;
}];
export declare const esEmailValido: (email: string) => boolean;
export declare const PeticioSchema: z.ZodObject<{
    id_centre: z.ZodNumber;
    id_taller: z.ZodNumber;
    alumnes_aprox: z.ZodNumber;
    comentaris: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const AssignmentChecklistSchema: z.ZodObject<{
    id_checklist: z.ZodNumber;
    completat: z.ZodBoolean;
    url_evidencia: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, z.core.$strip>;
export declare const CentreAttendanceSchema: z.ZodObject<{
    id_centre: z.ZodNumber;
    asistencia_reunion: z.ZodBoolean;
}, z.core.$strip>;
export type PeticioInput = z.infer<typeof PeticioSchema>;
export type AssignmentChecklistInput = z.infer<typeof AssignmentChecklistSchema>;
export type CentreAttendanceInput = z.infer<typeof CentreAttendanceSchema>;
