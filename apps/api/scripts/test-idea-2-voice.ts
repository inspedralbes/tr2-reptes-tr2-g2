
import { NLPService } from '../src/services/nlp.service';

const runTest = () => {
    console.log("mic 🎤 Testing Idea 2: Voice Assistant (NLP Service)\n");

    const nlp = new NLPService();

    // Test Case 1: Punctuality (Late)
    const text1 = "El alumno ha llegado 10 minutos tarde a clase pero se ha incorporado bien.";
    console.log(`📝 Case 1: "${text1}"`);
    const result1 = nlp.processText(text1);
    console.log(`   ➡ Attendance: ${result1.attendanceStatus} (Expected: Retard)`);
    console.log(`   ➡ Competence: ${result1.competenceUpdate ? 'Detected' : 'None'}\n`);

    // Test Case 2: Absence
    const text2 = "Hoy no ha venido, tiene falta injustificada.";
    console.log(`📝 Case 2: "${text2}"`);
    const result2 = nlp.processText(text2);
    console.log(`   ➡ Attendance: ${result2.attendanceStatus} (Expected: Absencia)`);
    console.log(`   ➡ Competence: ${result2.competenceUpdate ? 'Detected' : 'None'}\n`);

    // Test Case 3: Positive Participation (Competence)
    const text3 = "Ha participado mucho y ayuda a sus compañeros con las dudas del proyecto.";
    console.log(`📝 Case 3: "${text3}"`);
    const result3 = nlp.processText(text3);
    console.log(`   ➡ Attendance: ${result3.attendanceStatus} (Expected: undefined/Present)`);
    if (result3.competenceUpdate) {
        console.log(`   ➡ Competence: Score ${result3.competenceUpdate.score} (Expected: 5)`);
        console.log(`   ➡ Reason: Positive keywords detected.`);
    } else {
        console.log(`   ❌ Competence not detected!`);
    }

};

runTest();
