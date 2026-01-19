"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoAssignmentService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const assignment_solver_1 = require("./assignment.solver");
class AutoAssignmentService {
    constructor() {
        this.solver = new assignment_solver_1.AssignmentSolver();
    }
    /**
     * Generates assignments for all pending Petitions (Modalitat C preferably)
     * for a specific set of Talleres (or all).
     */
    async generateAssignments() {
        // 1. Fetch Approved Petitions that are not yet assigned (or overwrite?)
        // We filter by Modalitat C as per requirement, but logic applies generally if needed
        const petitions = await prisma_1.default.peticio.findMany({
            where: {
                estat: 'Aprovada',
                modalitat: 'C',
                // Optional: Filter out if already has assignments?
                // For now we assume we are running this for pending stuff.
                // But since we changed relation to 1:N, checking 'assignacions: { none: {} }' is safer
                assignacions: {
                    none: {}
                }
            },
            include: {
                centre: true,
                alumnes: true
            }
        });
        if (petitions.length === 0)
            return { message: 'No petitions found to process.' };
        // 2. Group Students by Taller
        // Map TallerId -> Students[]
        const studentsByTaller = new Map();
        const petitionMap = new Map(); // Map StudentId -> Peticio (to track back)
        const studentPeticioMap = new Map();
        petitions.forEach((p) => {
            if (!studentsByTaller.has(p.id_taller)) {
                studentsByTaller.set(p.id_taller, []);
            }
            const list = studentsByTaller.get(p.id_taller);
            // If petition has specific students linked
            if (p.alumnes.length > 0) {
                p.alumnes.forEach((a) => {
                    list.push({ id: a.id_alumne, centerId: p.id_centre });
                    studentPeticioMap.set(a.id_alumne, p.id_peticio);
                });
            }
            else {
                // Validation: Modalitat C usually requires nominal registration beforehand? 
                // If no students, we can't assign. Skip.
                console.warn(`Peticio ${p.id_peticio} has no students linked.`);
            }
        });
        // 3. Process each Taller
        const results = [];
        for (const [tallerId, students] of studentsByTaller.entries()) {
            // Fetch Taller capacity/info
            const taller = await prisma_1.default.taller.findUnique({ where: { id_taller: tallerId } });
            if (!taller)
                continue;
            // Calculate needed groups
            // default capacity 16 per group
            const GROUP_CAPACITY = 16;
            const totalStudents = students.length;
            const groupsNeeded = Math.ceil(totalStudents / GROUP_CAPACITY);
            // Create Slots
            const slots = [];
            for (let i = 1; i <= groupsNeeded; i++) {
                slots.push({
                    workshopId: tallerId,
                    groupId: i,
                    capacity: GROUP_CAPACITY
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
    async saveAssignments(assignments, studentPeticioMap) {
        // We need to group assignments by (Peticio, Group) to create Assignacio records
        // Map: Key="${peticioId}-${groupId}" -> Value={ studentIds[] }
        const grouping = new Map();
        assignments.forEach(a => {
            const peticioId = studentPeticioMap.get(a.studentId);
            if (!peticioId)
                return;
            const key = `${peticioId}-${a.groupId}`;
            if (!grouping.has(key)) {
                grouping.set(key, {
                    peticioId,
                    groupId: a.groupId,
                    workshopId: a.workshopId,
                    students: []
                });
            }
            grouping.get(key).students.push(a.studentId);
        });
        // Process DB writes
        for (const group of grouping.values()) {
            // 1. Create Assignacio
            // Find center ID from peticio? We need to fetch it or cheat.
            // We know peticioId exists.
            const peticio = await prisma_1.default.peticio.findUnique({ where: { id_peticio: group.peticioId } });
            if (!peticio)
                continue;
            const assignacio = await prisma_1.default.assignacio.create({
                data: {
                    id_peticio: group.peticioId,
                    id_centre: peticio.id_centre,
                    id_taller: group.workshopId,
                    grup: group.groupId,
                    estat: 'En_curs'
                }
            });
            // 2. Create Inscripcions
            await prisma_1.default.inscripcio.createMany({
                data: group.students.map(sid => ({
                    id_assignacio: assignacio.id_assignacio,
                    id_alumne: sid
                }))
            });
        }
    }
}
exports.AutoAssignmentService = AutoAssignmentService;
