"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePeticioStatusSchema = exports.createPeticioSchema = void 0;
const zod_1 = require("zod");
exports.createPeticioSchema = zod_1.z.object({
    body: zod_1.z.object({
        id_taller: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform((val) => parseInt(val))]).pipe(zod_1.z.number().int().positive()),
        alumnes_aprox: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform((val) => parseInt(val))]).pipe(zod_1.z.number().int().positive()).optional().nullable(),
        comentaris: zod_1.z.string().optional().nullable(),
    }),
});
exports.updatePeticioStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'ID ha de ser numèric'),
    }),
    body: zod_1.z.object({
        estat: zod_1.z.enum(['Pendent', 'Aprovada', 'Rebutjada']),
    }),
});
