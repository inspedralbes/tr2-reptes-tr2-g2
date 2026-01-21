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

  // 1. Get all approved (or pending) petitions that don't have an assignment yet
  const petitions = await prisma.peticio.findMany({
    where: {
      estat: { in: [EstatPeticio.Aprovada, EstatPeticio.Pendent] },
      assignacions: { none: {} }
    },
    include: {
      taller: true,
      centre: true
    },
    orderBy: {
      data_peticio: 'asc' // Strict FIFO: First come, first served
    }
  });

  stats.totalPetitions = petitions.length;
  stats.totalStudents = petitions.reduce((acc, p) => acc + (p.alumnes_aprox || 0), 0);

  if (petitions.length === 0) {
    console.log('ℹ️ TetrisService: No approved petitions found waiting for assignment.');
  } else {
    console.log(`🚀 TetrisService: Starting assignment for ${petitions.length} petitions...`);
  }

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
    
    // 1. Calculate strictly occupied capacity from existing assignments
    const existingAssignments = await prisma.assignacio.findMany({
      where: { id_taller: parseInt(tallerId) },
      include: { peticio: true }
    });

    const occupiedPlazas = existingAssignments.reduce((sum, a) => {
      return sum + (a.peticio?.alumnes_aprox || 0);
    }, 0);

    let currentCapacity = taller.places_maximes - occupiedPlazas;

    console.log(`📊 Taller ID ${tallerId} (${taller.titol}): Plazas Totales: ${taller.places_maximes}, Ocupadas: ${occupiedPlazas}, Disponibles: ${currentCapacity}`);

    if (currentCapacity <= 0) {
      console.log(`🚫 Taller ${tallerId} está lleno. Saltando ${tallerPetitions.length} peticiones.`);
      stats.workshopsFull++;
      continue;
    }
    for (const petition of tallerPetitions) {
      const neededPlazas = petition.alumnes_aprox || 0;

      if (currentCapacity >= neededPlazas) {
        // 1. If petition is Pendent, approve it automatically
        if (petition.estat === EstatPeticio.Pendent) {
          console.log(`✅ TetrisService: Auto-approving petition ${petition.id_peticio} for center ID ${petition.id_centre}`);
          await prisma.peticio.update({
            where: { id_peticio: petition.id_peticio },
            data: { estat: EstatPeticio.Aprovada }
          });
        }

        // 2. Create Assignment
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
      } else {
        console.log(`⚠️ TetrisService: Skipping petition ${petition.id_peticio} due to insufficient capacity in taller ${tallerId} (Needed: ${neededPlazas}, Available: ${currentCapacity})`);
      }
    }

    if (currentCapacity === 0) {
      stats.workshopsFull++;
    }
  }

  return { stats, createdAssignments };
}
