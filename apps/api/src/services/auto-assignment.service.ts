import prisma from '../lib/prisma';
import { AssignmentSolver, Student, WorkshopSlot, AssignmentResult } from './assignment.solver';

export class AutoAssignmentService {
    private solver: AssignmentSolver;
    private readonly GROUP_CAPACITY = 16;

    constructor() {
        this.solver = new AssignmentSolver();
    }

    /**
     * Generates assignments for all pending Petitions (Modalitat C preferably)
     * for a specific set of Talleres (or all).
     */
    async generateAssignments() {
        // 1. Fetch Approved Petitions that are not yet assigned (or overwrite?)
        // We filter by Modalitat C as per requirement, but logic applies generally if needed
        const petitions = await prisma.peticio.findMany({
            where: {
                estat: { in: ['Aprovada', 'Pendent'] },
                modalitat: 'C',
                assignacions: {
                    none: {}
                }
            },
            include: {
                centre: true,
                alumnes: true
            },
            orderBy: {
                data_peticio: 'asc'
            }
        });

        if (petitions.length === 0) {
            console.log('ℹ️ AutoAssignmentService: No approved petitions of Modalitat C found that are not yet assigned.');
            return { message: 'No petitions found to process.' };
        }

        console.log(`🚀 AutoAssignmentService: Processing ${petitions.length} petitions of Modalitat C...`);

        // 2. Group Students by Taller
        // Map TallerId -> Students[]
        const studentsByTaller = new Map<number, Student[]>();
        const petitionMap = new Map<number, typeof petitions[0]>(); // Map StudentId -> Peticio (to track back)
        const studentPeticioMap = new Map<number, number>();

        petitions.forEach((p: any) => {
            if (!studentsByTaller.has(p.id_taller)) {
                studentsByTaller.set(p.id_taller, []);
            }
            const list = studentsByTaller.get(p.id_taller)!;

            // If petition has specific students linked
            if (p.alumnes && p.alumnes.length > 0) {
                p.alumnes.forEach((a: any) => {
                    list.push({ id: a.id_alumne, centerId: p.id_centre });
                    studentPeticioMap.set(a.id_alumne, p.id_peticio);
                });
            } else {
                console.warn(`⚠️ AutoAssignmentService: Petition ${p.id_peticio} (Centre ID ${p.id_centre}) has 0 linked students. Skipping nominal assignment for this petition.`);
            }
        });

        // 3. Process each Taller
        const results = [];

        for (const [tallerId, students] of studentsByTaller.entries()) {
            // Fetch Taller capacity/info
            const taller = await prisma.taller.findUnique({ where: { id_taller: tallerId } });
            if (!taller) continue;

            // 1. Calculate occupied capacity from existing assignments
            // We sum the actual number of nominal inscriptions if they exist, 
            // otherwise we fall back to approx students
            const existingAssignments = await prisma.assignacio.findMany({
              where: { id_taller: tallerId },
              include: { 
                peticio: true,
                inscripcions: true 
              }
            });

            const occupiedPlazas = existingAssignments.reduce((sum: number, a: any) => {
              const nominalCount = a.inscripcions.length;
              return sum + (nominalCount > 0 ? nominalCount : (a.peticio?.alumnes_aprox || 0));
            }, 0);

            const remainingCapacity = taller.places_maximes - occupiedPlazas;
            console.log(`📊 AutoAssignment: Taller ID ${tallerId} (${taller.titol}): Plazas Totales: ${taller.places_maximes}, Ocupadas: ${occupiedPlazas}, Disponibles: ${remainingCapacity}`);

            const totalStudents = students.length;

            if (remainingCapacity <= 0) {
              console.warn(`🚫 AutoAssignment: Workshop ${tallerId} is full. Cannot assign ${totalStudents} students.`);
              continue;
            }

            // Calculate needed groups based on remaining capacity
            const groupsNeeded = Math.min(
                Math.ceil(totalStudents / this.GROUP_CAPACITY),
                Math.floor(remainingCapacity / this.GROUP_CAPACITY) || 1 // At least 1 if there is some capacity
            );

            // Create Slots
            const slots: WorkshopSlot[] = [];
            for (let i = 1; i <= groupsNeeded; i++) {
                slots.push({
                    workshopId: tallerId,
                    groupId: i,
                    capacity: this.GROUP_CAPACITY
                });
            }

            // Run Solver
            const assignments = this.solver.solve(students, slots);

            // Save assignments
            await this.saveAssignments(assignments, studentPeticioMap);
            results.push(...assignments);
        }

        return { assigned: results.length, details: results };
    }

    private async saveAssignments(assignments: AssignmentResult[], studentPeticioMap: Map<number, number>) {
        // We need to group assignments by (Peticio, Group) to create Assignacio records
        // Map: Key="${peticioId}-${groupId}" -> Value={ studentIds[] }

        const grouping = new Map<string, { peticioId: number, groupId: number, workshopId: number, students: number[] }>();

        assignments.forEach(a => {
            const peticioId = studentPeticioMap.get(a.studentId);
            if (!peticioId) return;

            const key = `${peticioId}-${a.groupId}`;
            if (!grouping.has(key)) {
                grouping.set(key, {
                    peticioId,
                    groupId: a.groupId,
                    workshopId: a.workshopId,
                    students: []
                });
            }
            grouping.get(key)!.students.push(a.studentId);
        });

        // Process DB writes
        for (const group of grouping.values()) {
            // 1. Create Assignacio
            // Find center ID from peticio? We need to fetch it or cheat.
            // We know peticioId exists.
            const peticio = await prisma.peticio.findUnique({ where: { id_peticio: group.peticioId } });
            if (!peticio) continue;

            // 1. Auto-approve if it was Pendent
            if (peticio.estat === 'Pendent') {
                console.log(`✅ AutoAssignmentService: Auto-approving petition ${peticio.id_peticio} for center ID ${peticio.id_centre}`);
                await prisma.peticio.update({
                    where: { id_peticio: peticio.id_peticio },
                    data: { estat: 'Aprovada' }
                });
            }

            const assignacio = await prisma.assignacio.create({
                data: {
                    id_peticio: group.peticioId,
                    id_centre: peticio.id_centre,
                    id_taller: group.workshopId,
                    estat: 'En_curs'
                }
            });

            // 2. Create Inscripcions
            await prisma.inscripcio.createMany({
                data: group.students.map(sid => ({
                    id_assignacio: assignacio.id_assignacio,
                    id_alumne: sid
                }))
            });
        }
    }
}
