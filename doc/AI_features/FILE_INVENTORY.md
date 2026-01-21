# Inventario de Cambios - Implementación AI

Este documento lista todos los archivos y carpetas que han sido creados o modificados durante la implementación de las 4 ideas de Inteligencia Artificial.

## 📂 Archivos y Carpetas Creados

### Backend (Lógica)
*   `apps/api/src/services/assignment.solver.ts` (Idea 1)
*   `apps/api/src/services/auto-assignment.service.ts` (Idea 1)
*   `apps/api/src/services/nlp.service.ts` (Idea 2)
*   `apps/api/src/services/risk-analysis.service.ts` (Idea 3)
*   `apps/api/src/services/vision.service.ts` (Idea 4)
*   `apps/api/src/controllers/evaluation.controller.ts` (Idea 2)
*   `apps/api/src/routes/evaluation.routes.ts` (Idea 2)


### Documentación
*   `doc/AI_features/README.md`
*   `doc/AI_features/walkthrough.md`
*   `doc/AI_features/FILE_INVENTORY.md` (Este archivo)
*   `doc/AI_features/DOCUMENTACION_IA_COMPLETA.md` (Guía consolidada de las 4 ideas)
*   `doc/AI_features/AI_RECONSTRUCTION_PROMPT.md` (Prompt maestro de recuperación)

---

## 📝 Archivos Modificados

### Base de Datos y Configuración
*   `apps/api/prisma/schema.prisma`: Añadidos campos para asignación de grupos (`grup`) y relaciones 1:N.
*   `tsconfig.json`: Reparada configuración raíz.
*   `package.json`: Añadida dependencia `expo` para resolver conflictos de tipos.

### Controladores y Rutas (Backend)
*   `apps/api/src/controllers/assignacio.controller.ts`: Añadidos métodos `generateAutomaticAssignments` y `validateDocumentUpload`.
*   `apps/api/src/controllers/stats.controller.ts`: Añadido método `runRiskAnalysis`.
*   `apps/api/src/routes/assignacio.routes.ts`: Añadidos endpoints.
*   `apps/api/src/routes/stats.routes.ts`: Añadidos endpoints.
*   `apps/api/src/routes/index.ts`: Registrada ruta de evaluación.
