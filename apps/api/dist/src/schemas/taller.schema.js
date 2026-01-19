"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTallerSchema = exports.createTallerSchema = void 0;
const zod_1 = require("zod");
exports.createTallerSchema = zod_1.z.object({
    body: zod_1.z.object({
        titol: zod_1.z.string().min(3, 'El título debe tener al menos 3 caracteres'),
        descripcio: zod_1.z.string().optional(),
        durada_h: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform((val) => parseInt(val))]).pipe(zod_1.z.number().positive()),
        places_maximes: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform((val) => parseInt(val))]).pipe(zod_1.z.number().positive()),
        modalitat: zod_1.z.enum(['A', 'B', 'C']),
        id_sector: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform((val) => parseInt(val))]).pipe(zod_1.z.number().int().positive()),
    }),
});
exports.updateTallerSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'ID debe ser numérico'),
    }),
    body: exports.createTallerSchema.shape.body.partial(),
});
