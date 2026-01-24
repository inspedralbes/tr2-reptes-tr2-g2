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

            // Create Slots until we cover all students OR run out of capacity
            // We ensure we don't create "phantom" capacity that exceeds the workshop limit
            const slots: WorkshopSlot[] = [];
            let currentRemaining = remainingCapacity;
            let groupId = 1;

            while (currentRemaining > 0) {
                // If we already have enough capacity for all students, stop creating new groups
                const currentTotalCapacity = slots.reduce((acc, s) => acc + s.capacity, 0);
                if (currentTotalCapacity >= totalStudents) break;

                const slotCap = Math.min(this.GROUP_CAPACITY, currentRemaining);
                slots.push({
                    workshopId: tallerId,
                    groupId: groupId++,
                    capacity: slotCap
                });

                currentRemaining -= slotCap;
            }

            // Run Solver
            const assignments = this.solver.solve(students, slots);

            // Save assignments
            await this.saveAssignments(assignments, studentPeticioMap);
            results.push(...assignments);
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
                    estat: 'PUBLISHED',
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

            // 1.5 Generate Sessions based on Taller Schedule
            const taller = await prisma.taller.findUnique({ where: { id_taller: group.workshopId } });
            if (taller && taller.dies_execucio) {
                const schedule = taller.dies_execucio as any[]; // { dayOfWeek: number, startTime: string, endTime: string }[]
                
                if (Array.isArray(schedule) && schedule.length > 0) {
                     const sessionsData = schedule.map(slot => {
                        // Calculate next occurrence of this dayOfWeek
                        // dayOfWeek: 1=Mon ... 5=Fri
                        // We start looking from tomorrow to be safe
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        
                        // Find next date matches slot.dayOfWeek
                        // slot.dayOfWeek is 1-5. JS getDay() is 0(Sun)-6(Sat). 
                        // So Mon(1) is JS(1). 
                        while (d.getDay() !== slot.dayOfWeek) {
                            d.setDate(d.getDate() + 1);
                        }

                        return {
                            id_assignacio: assignacio.id_assignacio,
                            data_sessio: d,
                            hora_inici: slot.startTime,
                            hora_fi: slot.endTime
                        };
                     });

                     await prisma.sessio.createMany({
                        data: sessionsData
                     });
                     
                     console.log(`📅 AutoAssignment: Generated ${sessionsData.length} sessions for Assignment ${assignacio.id_assignacio}`);
                }
            }

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
