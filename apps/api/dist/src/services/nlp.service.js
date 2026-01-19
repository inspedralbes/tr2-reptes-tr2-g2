"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NLPService = void 0;
class NLPService {
    /**
     * Analyzes the teacher's input text to extract structured data.
     */
    processText(text) {
        const lowerText = text.toLowerCase();
        const result = {
            cleanedObservation: text
        };
        // 1. Detect Punctuality
        if (lowerText.includes('tarde') || lowerText.includes('retraso') || lowerText.includes('retard')) {
            result.attendanceStatus = 'Retard';
        }
        else if (lowerText.includes('falta') || lowerText.includes('no ha venido') || lowerText.includes('absent')) {
            result.attendanceStatus = 'Absencia';
        }
        else if (lowerText.includes('justificad')) {
            result.attendanceStatus = 'Absencia_Justificada';
        }
        else if (lowerText.includes('puntual') || lowerText.includes('a tiempo')) {
            result.attendanceStatus = 'Present';
        }
        // 2. Detect Competence (Teamwork / Initiative)
        // Keywords for positive transversal competence
        const positiveKeywords = ['ayuda', 'lidera', 'iniciativa', 'proactiv', 'colabora', 'equip', 'ajuda'];
        const matches = positiveKeywords.filter(k => lowerText.includes(k));
        if (matches.length > 0) {
            result.competenceUpdate = {
                competenceName: 'Transversal', // General assumption for this prototype
                score: 5, // High score for positive mention
                reason: `Detected positive behaviors: ${matches.join(', ')}`
            };
        }
        return result;
    }
}
exports.NLPService = NLPService;
