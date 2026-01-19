"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCentreSchema = exports.createCentreSchema = void 0;
const zod_1 = require("zod");
exports.createCentreSchema = zod_1.z.object({
    body: zod_1.z.object({
        codi_centre: zod_1.z.string().min(3, 'Codi de centre obligatori'),
        nom: zod_1.z.string().min(3, 'Nom obligatori'),
        adreca: zod_1.z.string().optional(),
        telefon_contacte: zod_1.z.string().optional(),
        email_contacte: zod_1.z.string().email('Email invàlid').optional().or(zod_1.z.literal('')),
        asistencia_reunion: zod_1.z.boolean().optional(),
    }),
});
exports.updateCentreSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'ID ha de ser numèric'),
    }),
    body: exports.createCentreSchema.shape.body.partial(),
});
