
import { Request, Response } from 'express';
import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * ESPECÍFIC: Configuracions variables per tipologia 
 * (exemple: taller_tecnologic.requisits_tecnics vs taller_artistic.materials)
 */
export const updateWorkshopMetadata = async (req: Request, res: Response) => {
    const { id } = req.params;
    const metadata = req.body; // Puede traer campos variables

    try {
        const { db } = await connectToDatabase();

        // Usamos $set. El esquema es flexible, por lo que aceptamos cualquier campo
        const result = await db.collection('workshop_metadata').updateOne(
            { taller_id: parseInt(id as string) },
            {
                $set: {
                    ...metadata,
                    updated_at: new Date()
                }
            },
            { upsert: true }
        );

        res.json({ success: true, message: 'Metadades actualitzades correctament', result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * ESPECÍFIC: Operacions atòmiques amb $inc 
 * Evita race conditions en reserves simultànies
 */
export const bookWorkshopPlace = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const { db } = await connectToDatabase();

        // Verificamos y decrementamos atómicamente si hay plazas
        const result = await db.collection('workshop_metadata').findOneAndUpdate(
            {
                taller_id: parseInt(id as string),
                places_disponibles: { $gt: 0 }
            },
            { $inc: { places_disponibles: -1 } },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(400).json({ error: 'No queden places disponibles o el taller no existeix' });
        }

        res.json({ success: true, remaining: result.places_disponibles });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
