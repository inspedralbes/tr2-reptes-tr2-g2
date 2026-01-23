import prisma from '../lib/prisma';
import { AssignmentSolver, Student, WorkshopSlot, AssignmentResult } from './assignment.solver';

export class AutoAssignmentService {
    private solver: AssignmentSolver;
    private readonly GROUP_CAPACITY = 16;
    private readonly GLOBAL_CENTER_LIMIT = 12; // Max 12 students globally in Mod C

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

        // 3. Process each Taller and collect candidates
        const allAssignments: AssignmentResult[] = [];
        const centerPlazaCount = new Map<number, number>();

        for (const [tallerId, students] of studentsByTaller.entries()) {
            const taller = await prisma.taller.findUnique({ where: { id_taller: tallerId } });
            if (!taller) continue;

            const existingAssignments = await prisma.assignacio.findMany({
              where: { id_taller: tallerId },
              include: { 
                peticio: true,
                inscripcions: true 
              }
            });

            const occupiedPlazas = existingAssignments.reduce((sum: number, a: any) => {
              return sum + a.inscripcions.length;
            }, 0);

            const remainingCapacity = taller.places_maximes - occupiedPlazas;
            const groupsNeeded = Math.min(
                Math.ceil(students.length / this.GROUP_CAPACITY),
                Math.floor(remainingCapacity / this.GROUP_CAPACITY) || 1
            );

            const slots: WorkshopSlot[] = [];
            for (let i = 1; i <= groupsNeeded; i++) {
                slots.push({ workshopId: tallerId, groupId: i, capacity: this.GROUP_CAPACITY });
            }

            // Run Solver for this workshop
            const tallerAssignments = this.solver.solve(students, slots);
            
            // Filter assignments based on global center limit
            for (const assig of tallerAssignments) {
                const student = students.find(s => s.id === assig.studentId);
                if (!student) continue;

                const currentCount = centerPlazaCount.get(student.centerId) || 0;
                if (currentCount < this.GLOBAL_CENTER_LIMIT) {
                    allAssignments.push(assig);
                    centerPlazaCount.set(student.centerId, currentCount + 1);
                } else {
                    console.log(`⚠️ AutoAssignment: Global limit reached for Center ${student.centerId}. Skipping student ${student.id} in Workshop ${tallerId}.`);
                }
            }
        }

        // 4. Save all collected assignments
        if (allAssignments.length > 0) {
            await this.saveAssignments(allAssignments, studentPeticioMap);
        }

        return { assigned: allAssignments.length, details: allAssignments };
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
                    estat: 'PROVISIONAL',
                    // Initialize checklist for Phase 2
                    checklist: {
                      create: [
                        { pas_nom: 'Designar Profesores Referentes', completat: false },
                        { pas_nom: 'Subir Registro Nominal (Excel)', completat: true }, // Already done by auto-assignment
                        { pas_nom: 'Acuerdo Pedagógico (Modalidad C)', completat: false }
                      ]
                    }
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
