import { Request, Response } from 'express';
import { AvaluacioService } from '../services/avaluacio.service';

const avaluacioService = new AvaluacioService();

export const getAvaluacioInscripcio = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const avaluacio = await avaluacioService.getAvaluacioInscripcio(parseInt(id as string));
        if (!avaluacio) {
            return res.status(404).json({ error: 'Evaluación no encontrada' });
        }
        res.json(avaluacio);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la evaluación' });
    }
};

export const upsetAvaluacioDocent = async (req: Request, res: Response) => {
    try {
        const result = await avaluacioService.upsertAvaluacio(req.body);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar la evaluación' });
    }
};

export const getCompetencies = async (req: Request, res: Response) => {
    try {
        const competencies = await avaluacioService.getCompetencies();
        res.json(competencies);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener competencias' });
    }
};

export const analyzeObservations = async (req: Request, res: Response) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'El texto es obligatorio' });
    }
    try {
        const analysis = await avaluacioService.analyzeObservationsAI(text);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: 'Error al analizar las observaciones' });
    }
};
