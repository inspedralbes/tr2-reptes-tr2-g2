# PROMPT MAESTRO PARA RECONSTRUCCIÓN / MERGE

**Instrucción para el Usuario**:
Si encuentras conflictos graves al hacer merge con la rama principal, copia y pega el contenido de abajo en un chat con un Agente AI (como yo). Este prompt contiene todo el código fuente y las instrucciones precisas para volver a implementar las 4 funcionalidades IA desde cero en cualquier rama limpia.

---
**[INICIO DEL PROMPT PARA LA IA]**

Actúa como un Ingeniero Senior de Software. Necesito que integres 4 funcionalidades de Inteligencia Artificial en mi proyecto Node.js/Typescript (Monorepo NX, Prisma, Express).

A continuación te doy los archivos exactos que debes crear o modificar. Si encuentras código existente, intégralo con cuidado.

## 1. Configuración Previa (Dependencias)
Asegúrate de que `package.json` en la raíz tenga `"expo": "~54.0.29"` si hay errores de Typescript relacionados con `tsconfig base`.

## 2. MODIFICACIONES DE BASE DE DATOS (Prisma)
Edita `apps/api/prisma/schema.prisma`:
1.  En el modelo `Assignacio`, añade el campo: `grup Int @default(1)`.
2.  En el modelo `Assignacio`, elimina `@unique` del campo `id_peticio`.
3.  En el modelo `Peticio`, cambia la relación `assignacions` para que sea un array: `Assignacio[]`.

*Luego recuerda que tendré que ejecutar `npx prisma db push`.*

## 3. IDEA 1: MOTOR DE ASIGNACIÓN
Crea/Sobrescribe `apps/api/src/services/assignment.solver.ts`:
```typescript
export interface Student { id: number; centerId: number; }
export interface WorkshopSlot { workshopId: number; groupId: number; capacity: number; }
export interface AssignmentResult { studentId: number; workshopId: number; groupId: number; }

export class AssignmentSolver {
  public solve(students: Student[], slots: WorkshopSlot[]): AssignmentResult[] {
    const slotsState = slots.map(s => ({ ...s, assigned: [] as Student[], centerCounts: {} as Record<number, number> }));
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const results: AssignmentResult[] = [];
    const unassigned: Student[] = [];

    for (const student of shuffled) {
       // Buscar slots válidos (capacidad < max Y centro_count < 4)
       const valid = slotsState.filter(s => s.assigned.length < s.capacity && (s.centerCounts[student.centerId] || 0) < 4);
       if (valid.length > 0) {
           // Ordenar para balancear (el que tenga menos de este centro)
           valid.sort((a, b) => (a.centerCounts[student.centerId]||0) - (b.centerCounts[student.centerId]||0));
           const best = valid[0];
           best.assigned.push(student);
           best.centerCounts[student.centerId] = (best.centerCounts[student.centerId] || 0) + 1;
           results.push({ studentId: student.id, workshopId: best.workshopId, groupId: best.groupId });
       } else {
           unassigned.push(student);
       }
    }
    return results;
  }
}
```

Crea/Sobrescribe `apps/api/src/services/auto-assignment.service.ts`:
```typescript
import prisma from '../lib/prisma';
import { AssignmentSolver, WorkshopSlot } from './assignment.solver';

export class AutoAssignmentService {
    private solver = new AssignmentSolver();

    async generateAssignments() {
        // 1. Buscar Peticiones Aprovadas Modalidad C sin asignar
        const petitions = await prisma.peticio.findMany({
            where: { estat: 'Aprovada', modalitat: 'C', assignacions: { none: {} } },
            include: { alumnes: true }
        });
        if (petitions.length === 0) return { message: 'No petitions' };

        // 2. Agrupar por Taller
        const studentsByTaller = new Map<number, any[]>();
        const studentToPetMap = new Map<number, number>();
        petitions.forEach(p => {
             if (!studentsByTaller.has(p.id_taller)) studentsByTaller.set(p.id_taller, []);
             p.alumnes.forEach(a => {
                 studentsByTaller.get(p.id_taller).push({ id: a.id_alumne, centerId: p.id_centre });
                 studentToPetMap.set(a.id_alumne, p.id_peticio);
             });
        });

        // 3. Resolver cada taller
        const results = [];
        for (const [tallerId, students] of studentsByTaller.entries()) {
             const groupsNeeded = Math.ceil(students.length / 16);
             const slots: WorkshopSlot[] = [];
             for(let i=1; i<=groupsNeeded; i++) slots.push({ workshopId: tallerId, groupId: i, capacity: 16 });
             
             const assignments = this.solver.solve(students, slots);
             
             // Guardar en DB (Crear Assignacio + Inscripcio)
             for (const text of assignments) {
                 const petId = studentToPetMap.get(text.studentId);
                 // Lógica simplificada de upsert assignacio + create inscripcio
                 let assignacio = await prisma.assignacio.findFirst({ where: { id_peticio: petId, grup: text.groupId } });
                 if (!assignacio) {
                     assignacio = await prisma.assignacio.create({ data: { id_peticio: petId, grup: text.groupId, id_taller: tallerId, id_centre: students.find(s=>s.id===text.studentId).centerId } });
                 }
                 await prisma.inscripcio.create({ data: { id_alumne: text.studentId, id_assignacio: assignacio.id_assignacio } });
                 results.push(text);
             }
        }
        return { assigned: results.length };
    }
}
```

## 4. IDEA 2: ASISTENTE DE VOZ
Crea `apps/api/src/services/nlp.service.ts`:
```typescript
export class NLPService {
    processText(text: string) {
        const t = text.toLowerCase();
        let att = undefined;
        if (t.includes('tarde') || t.includes('retraso')) att = 'Retard';
        else if (t.includes('falta') || t.includes('ausencia')) att = 'Absencia';
        
        const comp = (t.includes('lidera') || t.includes('ayuda')) ? { score: 5, name: 'Transversal' } : undefined;
        return { attendanceStatus: att, competenceUpdate: comp };
    }
}
```

Crea `apps/api/src/controllers/evaluation.controller.ts`:
```typescript
import { Request, Response } from 'express';
import { NLPService } from '../services/nlp.service';
import prisma from '../lib/prisma';

export const processVoiceEvaluation = async (req: Request, res: Response) => {
    const { text, studentId, sessionId, assignacioId } = req.body;
    const nlp = new NLPService();
    const result = nlp.processText(text);

    // Buscar inscripcio
    const inscripcio = await prisma.inscripcio.findFirst({ where: { id_alumne: Number(studentId) } });
    if (!inscripcio) return res.status(404).json({error: 'Student not found'});

    // Update Assistencia
    if (result.attendanceStatus) {
        // ... Upsert logic for assistencia ...
         await prisma.assistencia.create({ data: { id_inscripcio: inscripcio.id_inscripcio, numero_sessio: Number(sessionId), estat: result.attendanceStatus as any, observacions: text, data_sessio: new Date() } });
    }
    // Update Competencia
    if (result.competenceUpdate) {
         // ... Create avaluacio ...
         const comp = await prisma.competencia.findFirst({ where: { tipus: 'Transversal' } });
         if (comp) await prisma.avaluacioCompetencial.create({ data: { id_inscripcio: inscripcio.id_inscripcio, id_competencia: comp.id_competencia, puntuacio: result.competenceUpdate.score }});
    }
    res.json(result);
};
```

## 5. IDEA 3 y 4 (Resumido para copiar)
*Copia los archivos `vision.service.ts` y `risk-analysis.service.ts` que se encuentran en la carpeta `doc/AI_features/guias/` de este repositorio si los necesitas completos.*

## 6. RUTAS (Endpoints)
Asegúrate de exponer estos controladores en Express:
1.  POST `/api/assignacions/auto-generate` -> `AutoAssignmentService`.
2.  POST `/api/evaluation/voice-process` -> `EvaluationController`.
3.  POST `/api/stats/risk-analysis` -> `StatsController` (invocando `RiskAnalysisService`).
4.  POST `/api/assignacions/upload/validate` -> `AssignacioController` (invocando `VisionService`).

**[FIN DEL PROMPT]**
