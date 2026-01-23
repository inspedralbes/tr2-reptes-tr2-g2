
import { AssignmentSolver, Student, WorkshopSlot } from '../apps/api/src/services/assignment.solver';

const runVerification = () => {
    console.log('🧪 Starting Fairness Verification...');

    const solver = new AssignmentSolver();

    // Scenario: 2 Institutes, 4 Students each. Only 4 places available.
    const students: Student[] = [
        { id: 1, centerId: 101 }, { id: 2, centerId: 101 }, { id: 3, centerId: 101 }, { id: 4, centerId: 101 },
        { id: 5, centerId: 102 }, { id: 6, centerId: 102 }, { id: 7, centerId: 102 }, { id: 8, centerId: 102 }
    ];

    const slots: WorkshopSlot[] = [
        { workshopId: 1, groupId: 1, capacity: 4 }
    ];

    const result = solver.solve(students, slots);

    console.log(`📊 Assigned: ${result.length} students`);

    const center1Count = result.filter(r => [1, 2, 3, 4].includes(r.studentId)).length;
    const center2Count = result.filter(r => [5, 6, 7, 8].includes(r.studentId)).length;

    console.log(`🏫 Center 101 Assigned: ${center1Count}`);
    console.log(`🏫 Center 102 Assigned: ${center2Count}`);

    if (center1Count === 2 && center2Count === 2) {
        console.log('✅ SUCCESS: Fair distribution achieved (2 from each).');
    } else {
        console.error('❌ FAILURE: Unfair distribution.');
        process.exit(1);
    }
};

runVerification();
