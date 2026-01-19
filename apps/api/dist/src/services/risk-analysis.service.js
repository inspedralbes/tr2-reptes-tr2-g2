"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskAnalysisService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const notificacio_controller_1 = require("../controllers/notificacio.controller");
class RiskAnalysisService {
    /**
     * Analyzes risk for a specific student based on their recent activity.
     */
    async analyzeStudentRisk(studentId) {
        const factors = [];
        let riskScore = 0;
        // 1. Fetch Attendance (Last 5 sessions)
        // We assume we look at all active enrollments or specific one? 
        // Let's look at all recent attendance for simplicity.
        const recentAttendance = await prisma_1.default.assistencia.findMany({
            where: {
                inscripcio: { id_alumne: studentId }
            },
            orderBy: { data_sessio: 'desc' },
            take: 5
        });
        // 2. Calculate Attendance Risk
        if (recentAttendance.length > 0) {
            let absences = 0;
            let late = 0;
            recentAttendance.forEach((a) => {
                if (a.estat === 'Absencia')
                    absences++;
                if (a.estat === 'Retard')
                    late++;
            });
            if (absences >= 2) {
                riskScore += 40;
                factors.push('Multiple unjustified absences in recent sessions');
            }
            else if (absences === 1) {
                riskScore += 15;
            }
            if (late >= 2) {
                riskScore += 10;
                factors.push('Persistent tardiness');
            }
        }
        else {
            // No attendance data? Maybe new student or hasn't started.
            // Low risk unless it's late in the phase.
        }
        // 3. Fetch Competence Evaluations (Low engagement?)
        const lowEvaluations = await prisma_1.default.avaluacioCompetencial.count({
            where: {
                inscripcio: { id_alumne: studentId },
                puntuacio: { lt: 3 }
            }
        });
        if (lowEvaluations > 0) {
            riskScore += (lowEvaluations * 10);
            factors.push(`Found ${lowEvaluations} low competency evaluations`);
        }
        // Cap score
        if (riskScore > 100)
            riskScore = 100;
        // Determine Level
        let riskLevel = 'LOW';
        if (riskScore >= 80)
            riskLevel = 'CRITICAL';
        else if (riskScore >= 50)
            riskLevel = 'HIGH';
        else if (riskScore >= 30)
            riskLevel = 'MEDIUM';
        // 4. Trigger Alert if Critical
        if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
            await this.triggerAlert(studentId, riskScore, factors);
        }
        return { studentId, riskScore, riskLevel, factors };
    }
    async triggerAlert(studentId, score, factors) {
        // Find Student Info
        const student = await prisma_1.default.alumne.findUnique({
            where: { id_alumne: studentId },
            include: { centre_procedencia: true }
        });
        if (!student || !student.centre_procedencia)
            return;
        // Create Notification for the Center
        // We don't have a direct User-Center map easily accessible maybe, 
        // but the notification controller handles id_centre linkage.
        await (0, notificacio_controller_1.createNotificacioInterna)({
            id_centre: student.centre_procedencia.id_centre,
            titol: `⚠️ Alerta de Riesgo: ${student.nom} ${student.cognoms}`,
            missatge: `El alumno presenta un riesgo de abandono del ${score}%. Factores: ${factors.join(', ')}. Se recomienda intervención.`,
            tipus: 'SISTEMA',
            importancia: 'URGENT'
        });
    }
}
exports.RiskAnalysisService = RiskAnalysisService;
