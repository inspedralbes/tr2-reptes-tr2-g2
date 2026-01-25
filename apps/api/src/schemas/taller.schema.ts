import { z } from 'zod';

export const createTallerSchema = z.object({
  body: z.object({
    titol: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
    descripcio: z.string().optional(),
    durada_h: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().positive()),
    places_maximes: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().positive()),
    modalitat: z.enum(['A', 'B', 'C']),
    id_sector: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().int().positive()),
    dies_execucio: z.array(z.object({
        dayOfWeek: z.number(),
        startTime: z.string(),
        endTime: z.string()
    })).or(z.array(z.string())).optional(),
  }),
});

export const updateTallerSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID debe ser numérico'),
  }),
  body: createTallerSchema.shape.body.partial(),
});
