"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHASES = exports.isPhaseActive = void 0;
const shared_1 = require("@iter/shared");
Object.defineProperty(exports, "PHASES", { enumerable: true, get: function () { return shared_1.PHASES; } });
const prisma_1 = __importDefault(require("./prisma"));
/**
 * Checks if a phase is active and the current date is within the phase's start and end dates.
 * @param phaseName The unique name of the phase to check.
 * @returns Object containing whether the phase is active and optionally the phase data.
 */
async function isPhaseActive(phaseName) {
    const now = new Date();
    const phase = await prisma_1.default.fase.findUnique({
        where: { nom: phaseName }
    });
    if (!phase) {
        return { isActive: false, error: `Fase '${phaseName}' no encontrada.` };
    }
    const isWithinDates = now >= phase.data_inici && now <= phase.data_fi;
    const isActive = phase.activa && isWithinDates;
    return {
        isActive,
        isWithinDates,
        phaseActiveFlag: phase.activa,
        phase
    };
}
exports.isPhaseActive = isPhaseActive;
