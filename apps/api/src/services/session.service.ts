import { addWeeks, isSameDay } from 'date-fns';
import prisma from '../lib/prisma';
import { EstatAssistencia } from '@prisma/client';

export class SessionService {
    /**
     * Generates 10 weekly session dates starting from the given start date.
     * Assumes sessions are weekly on the same day of the week as the start date.
     */
    static generateSessionDates(startDate: Date, totalSessions: number = 10): Date[] {
        const dates: Date[] = [];
        for (let i = 0; i < totalSessions; i++) {
            dates.push(addWeeks(startDate, i));
        }
        return dates;
    }

    /**
     * Ensures attendance records exist for a given assignment and session number.
     * If not, creates them for all currently enrolled students with status 'Present' (default) or 'Absencia' (to be decided, using Present as neutral initialization).
     * Note: It is better to initialize as 'Present' or wait for input. Let's use 'Present' as default placeholder logic, 
     * or we can check if we want a specific "Pending" state. Use 'Present' for now as per likely requirement.
     */
    static async ensureAttendanceRecords(idAssignacio: number, sessionNum: number, date: Date) {
        // 1. Get all enrollments for this assignment
        const enrollments = await prisma.inscripcio.findMany({
            where: { id_assignacio: idAssignacio }
        });

        if (enrollments.length === 0) return;

        // 2. Check which students already have attendance for this session
        const existingAttendance = await prisma.assistencia.findMany({
            where: {
                inscripcio: { id_assignacio: idAssignacio },
                numero_sessio: sessionNum
            },
            select: { id_inscripcio: true }
        });

        const existingIds = new Set(existingAttendance.map(a => a.id_inscripcio));

        // 3. Create missing records
        const missingEnrollments = enrollments.filter(e => !existingIds.has(e.id_inscripcio));

        if (missingEnrollments.length > 0) {
            await prisma.assistencia.createMany({
                data: missingEnrollments.map(e => ({
                    id_inscripcio: e.id_inscripcio,
                    numero_sessio: sessionNum,
                    data_sessio: date,
                    estat: EstatAssistencia.Present // Default state
                }))
            });
        }
    }

    /**
     * Retrieves the status of a session: 'Pending', 'Recorded', or 'Future'.
     * Simple heuristic based on existance of records.
     */
    static async getSessionStatus(idAssignacio: number, sessionNum: number): Promise<string> {
        const count = await prisma.assistencia.count({
            where: {
                inscripcio: { id_assignacio: idAssignacio },
                numero_sessio: sessionNum
            }
        });
        return count > 0 ? 'Recorded' : 'Pending';
    }
}
