import prisma from '../lib/prisma';
import { EstatPeticio } from '@prisma/client';

export interface TetrisStats {
  totalPetitions: number;
  assignedPetitions: number;
  totalStudents: number;
  assignedStudents: number;
  workshopsFull: number;
}

/**
 * Tetris Assignment Logic
 * 1. Get all 'Aprovada' petitions.
 * 2. Group them by taller.
 * 3. For each taller, attempt to fit the petitions.
 * 4. Priority: Modalidad C diversity (max 4 per center).
 */
export async function runTetris() {
  const stats: TetrisStats = {
    totalPetitions: 0,
    assignedPetitions: 0,
    totalStudents: 0,
    assignedStudents: 0,
    workshopsFull: 0
  };

  // 1. Get all approved petitions that don't have an assignment yet
  const petitions = await prisma.peticio.findMany({
    where: {
      estat: EstatPeticio.Aprovada,
      assignacions: { none: {} }
    },
    include: {
      taller: true,
      centre: true
    },
    orderBy: {
      data_peticio: 'asc' // First come, first served for ahora
    }
  });

  stats.totalPetitions = petitions.length;
  stats.totalStudents = petitions.reduce((acc, p) => acc + (p.alumnes_aprox || 0), 0);

  // Group by Taller
  const tallerGroups: Record<number, typeof petitions> = {};
  for (const p of petitions) {
    if (!tallerGroups[p.id_taller]) {
      tallerGroups[p.id_taller] = [];
    }
    tallerGroups[p.id_taller].push(p);
  }

  const createdAssignments = [];

  for (const tallerId in tallerGroups) {
    const tallerPetitions = tallerGroups[tallerId];
    const taller = (tallerPetitions[0] as any).taller;
    let currentCapacity = taller.places_maximes;

    // Diversity bookkeeping for Modalidad C (if applicable)
    // Though the petitions themselves already restricted to 4, we need to ensure the TOTAL for the taller is correct.

    for (const petition of tallerPetitions) {
      const neededPlazas = petition.alumnes_aprox || 0;

      if (currentCapacity >= neededPlazas) {
        // Create Assignment
        const assignacio = await prisma.assignacio.create({
          data: {
            id_peticio: petition.id_peticio,
            id_centre: petition.id_centre,
            id_taller: petition.id_taller,
            prof1_id: petition.prof1_id,
            prof2_id: petition.prof2_id,
            estat: 'En_curs',
            checklist: {
              create: [
                { pas_nom: 'Designar Profesores Referentes', completat: petition.prof1_id !== null && petition.prof2_id !== null },
                { pas_nom: 'Subir Registro Nominal (Excel)', completat: false },
                { pas_nom: 'Gestionar Acuerdo Pedagògic', completat: petition.modalitat !== 'C' },
                { pas_nom: 'Autorizaciones de Imagen y Desplazamiento', completat: false }
              ]
            }
          }
        });

        createdAssignments.push(assignacio);
        currentCapacity -= neededPlazas;
        stats.assignedPetitions++;
        stats.assignedStudents += neededPlazas;
      }
    }

    if (currentCapacity === 0) {
      stats.workshopsFull++;
    }
  }

  return { stats, createdAssignments };
}
