import { z } from 'zod';
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
export declare const THEME: {
    readonly colors: {
        readonly primary: "#00426B";
        readonly secondary: "#4197CB";
        readonly background: "#F9FAFB";
        readonly surface: "#FFFFFF";
        readonly text: {
            readonly primary: "#111827";
            readonly secondary: "#4B5563";
            readonly muted: "#9CA3AF";
        };
        readonly accent: "#F26178";
        readonly neutral: "#CFD2D3";
        readonly beige: "#E0C5AC";
    };
    readonly fonts: {
        readonly primary: "Helvetica Neue, Arial, sans-serif";
    };
};
export declare const CALENDARI: {
    readonly REUNION_PRESENTACION: "2025-09-30";
    readonly LIMITE_DEMANDA: "2025-10-10";
    readonly COMUNICACION_ASIGNACIONES: "2025-10-20";
    readonly GESTION_VACANTES: "2025-11-01";
};
export declare const PHASES: {
    readonly SOLICITUD: "Solicitud e Inscripción";
    readonly PLANIFICACION: "Planificación y Asignación";
    readonly EJECUCION: "Ejecución y Seguimiento";
    readonly CIERRE: "Cierre y Evaluación";
};
export declare const FASES_TIMELINE: readonly [{
    readonly id: "PRESENTACIO";
    readonly nom: "Solicitud e Inscripción";
    readonly data: "2025-09-30";
}, {
    readonly id: "DEMANDA";
    readonly nom: "Enviament de Demanda";
    readonly data: "2025-10-10";
}, {
    readonly id: "ASSIGNACIO";
    readonly nom: "Planificación y Asignación";
    readonly data: "2025-10-20";
}, {
    readonly id: "VACANTS";
    readonly nom: "Gestió de Vacants i Incidències";
    readonly data: "2025-11-01";
}, {
    readonly id: "VALIDACIO";
    readonly nom: "Cierre y Evaluación";
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
