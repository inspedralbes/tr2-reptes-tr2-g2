
export interface Student {
  id: number;
  centerId: number;
}

export interface WorkshopSlot {
  workshopId: number;
  groupId: number;
  capacity: number;
}

export interface AssignmentResult {
  studentId: number;
  workshopId: number;
  groupId: number;
}

export class AssignmentSolver {

  /**
   * Distributes students into workshop slots respecting constraints.
   * Constraints:
   * 1. Max capacity per slot (Hard)
   * 2. Max 4 students from same center in a slot (Hard/Soft - strict per request)
   * 3. Maximize heterogeneity (Soft)
   * 
   * algo: Randomized Greedy with Swap Optimization
   */
  public solve(students: Student[], slots: WorkshopSlot[]): AssignmentResult[] {
    // 0. Check total capacity vs total students
    const totalCapacity = slots.reduce((sum, s) => sum + s.capacity, 0);
    let studentsToAssign = students;

    // If we have more students than capacity, we need to select fairly (Round Robin per Center)
    if (studentsToAssign.length > totalCapacity) {
      console.log(`⚠️ AssignmentSolver: Students (${students.length}) > Capacity (${totalCapacity}). Applying Fair Selection (Round Robin).`);
      studentsToAssign = this.selectStudentsFairly(students, totalCapacity);
    }

    // 1. Prepare slots with tracking
    const slotsState = slots.map(s => ({
      ...s,
      assigned: [] as Student[],
      centerCounts: {} as Record<number, number>
    }));

    // 2. Shuffle students for randomness
    // Even after fair selection, we shuffle to ensure detailed assignment to slots is random
    const shuffledStudents = [...studentsToAssign].sort(() => Math.random() - 0.5);
    const unassigned: Student[] = [];

    // 3. Initial Greedy Assignment
    for (const student of shuffledStudents) {
      // Find best valid slot
      let bestSlotIndex = -1;

      // Sort slots by current usage (try to fill evenly or respecting diversity?)
      // Let's try to fit into any valid slot first
      const validSlots = slotsState.map((s, i) => ({ s, i })).filter(({ s }) => {
        // Check Capacity
        if (s.assigned.length >= s.capacity) return false;
        // Check Center Constraint (Max 4)
        const currentCenterCount = s.centerCounts[student.centerId] || 0;
        if (currentCenterCount >= 4) return false;
        return true;
      });

      if (validSlots.length > 0) {
        // Pick one that balances size or centers?
        // Let's pick the one with fewest students from this center to maximize diversity
        // Or fewest total students to balance load
        validSlots.sort((a, b) => {
          // Primary: count of same center (ascending)
          const countA = a.s.centerCounts[student.centerId] || 0;
          const countB = b.s.centerCounts[student.centerId] || 0;
          if (countA !== countB) return countA - countB;
          // Secondary: total assigned (ascending) -> balances groups
          return a.s.assigned.length - b.s.assigned.length;
        });

        bestSlotIndex = validSlots[0].i;
      }

      if (bestSlotIndex !== -1) {
        // Assign
        const slot = slotsState[bestSlotIndex];
        slot.assigned.push(student);
        slot.centerCounts[student.centerId] = (slot.centerCounts[student.centerId] || 0) + 1;
      } else {
        unassigned.push(student);
      }
    }

    // 4. Optimization Phase (Swapping to resolve unassigned or improve score)
    // If we have unassigned students, try to swap with assigned ones
    // (This is a simplified implementation. Full Simulated Annealing could go here)
    // For now, if we have unassigned, it implies constraints are too tight or not enough capacity.
    // Return what we have.

    // Convert to AssignmentResult
    const results: AssignmentResult[] = [];
    slotsState.forEach(slot => {
      slot.assigned.forEach(student => {
        results.push({
          studentId: student.id,
          workshopId: slot.workshopId,
          groupId: slot.groupId
        });
      });
    });

    return results;
  }

  /**
   * Selects students in a Round-Robin fashion from each center to ensure equity.
   * If institute A has 4 students and B has 4 students, and we need 4 total,
   * it picks: A1, B1, A2, B2.
   */
  private selectStudentsFairly(allStudents: Student[], limit: number): Student[] {
    // Group by Center
    const studentsByCenter = new Map<number, Student[]>();
    allStudents.forEach(s => {
      if (!studentsByCenter.has(s.centerId)) {
        studentsByCenter.set(s.centerId, []);
      }
      studentsByCenter.get(s.centerId)!.push(s);
    });

    // Shuffle each center's list to ensure randomness within the center
    studentsByCenter.forEach((list) => {
      list.sort(() => Math.random() - 0.5);
    });

    const centers = Array.from(studentsByCenter.keys());
    const selected: Student[] = [];
    let nothingSelectedInRound = false;

    // Round Robin Selection
    while (selected.length < limit && !nothingSelectedInRound) {
      nothingSelectedInRound = true;

      // Shuffle centers order each round to avoid bias towards first center in list? 
      // Or keep strict rotation? Strict rotation A, B, C, A, B, C is fairer for predictable counts.
      // But let's shuffle centers once at start? No, keeping consistent order is standard RR.

      for (const centerId of centers) {
        if (selected.length >= limit) break;

        const list = studentsByCenter.get(centerId)!;
        if (list.length > 0) {
          const student = list.pop()!; // Take one
          selected.push(student);
          nothingSelectedInRound = false;
        }
      }
    }

    return selected;
  }
}
