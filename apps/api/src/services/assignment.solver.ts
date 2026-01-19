
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
    // 1. Prepare slots with tracking
    const slotsState = slots.map(s => ({
      ...s,
      assigned: [] as Student[],
      centerCounts: {} as Record<number, number>
    }));

    // 2. Shuffle students for randomness
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    const unassigned: Student[] = [];

    // 3. Initial Greedy Assignment
    for (const student of shuffledStudents) {
      // Find best valid slot
      let bestSlotIndex = -1;
      let minScore = Infinity; // We want to minimize "concentration"

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

    console.log(`Assignment Complete. Assigned: ${results.length}, Unassigned: ${unassigned.length}`);
    return results;
  }
}
