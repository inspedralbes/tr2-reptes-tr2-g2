
import { AssignmentSolver, Student, WorkshopSlot } from '../src/services/assignment.solver';

const runTest = () => {
    console.log("🧪 Testing Idea 1: AI Assignment Engine (Constraint Satisfaction)\n");

    // 1. Setup Mock Data
    // We simulate 5 centers with varying number of students
    const centers = [101, 102, 103, 104, 105];
    const students: Student[] = [];

    // Create 50 students distributed across centers
    // Center 101 has many students (risk of concentration)
    for (let i = 0; i < 20; i++) students.push({ id: i, centerId: 101 });
    // Others have fewer
    for (let i = 20; i < 30; i++) students.push({ id: i, centerId: 102 });
    for (let i = 30; i < 38; i++) students.push({ id: i, centerId: 103 });
    for (let i = 38; i < 45; i++) students.push({ id: i, centerId: 104 });
    for (let i = 45; i < 50; i++) students.push({ id: i, centerId: 105 });

    console.log(`📊 Input: ${students.length} Students from ${centers.length} Centers.`);

    // Create 4 Workshop Groups (Slots) with capacity 16
    // Total capacity = 64 (enough for 50 students)
    const slots: WorkshopSlot[] = [
        { workshopId: 1, groupId: 1, capacity: 16 },
        { workshopId: 1, groupId: 2, capacity: 16 },
        { workshopId: 1, groupId: 3, capacity: 16 },
        { workshopId: 1, groupId: 4, capacity: 16 },
    ];

    console.log(`🏭 Workshops: ${slots.length} Groups with capacity 16 each.\n`);

    // 2. Run AI Solver
    console.log("🤖 Running AssignmentSolver...");
    const solver = new AssignmentSolver();
    const assignments = solver.solve(students, slots);

    // 3. Analyze Results
    console.log(`\n✅ Assigned: ${assignments.length}/${students.length} Students.`);

    // Group by Slot to check constraints
    const groups = new Map<number, { count: number, centers: Record<number, number> }>();

    assignments.forEach(a => {
        if (!groups.has(a.groupId)) {
            groups.set(a.groupId, { count: 0, centers: {} });
        }
        const g = groups.get(a.groupId)!;
        g.count++;
        g.centers[students.find(s => s.id === a.studentId)!.centerId] = (g.centers[students.find(s => s.id === a.studentId)!.centerId] || 0) + 1;
    });

    // Print Report
    console.log("\n📋 Group Analysis:");
    groups.forEach((data, groupId) => {
        console.log(`\n  🔹 Group ${groupId}:`);
        console.log(`     Size: ${data.count}/16`);

        const centerBreakdown = Object.entries(data.centers).map(([cid, count]) => `Center ${cid}: ${count}`).join(', ');
        console.log(`     Diversity: ${centerBreakdown}`);

        // Valdiate Constraints
        const maxPerCenter = Math.max(...Object.values(data.centers));
        if (maxPerCenter > 4) {
            console.log(`     ❌ CONSTRAINT VIOLATION: Max 4 students per center exceeded!`);
        } else {
            console.log(`     ✅ Constraint OK (Max per center <= 4)`);
        }
        if (data.count > 16) {
            console.log(`     ❌ CONSTRAINT VIOLATION: Capacity exceeded!`);
        }
    });

};

runTest();
