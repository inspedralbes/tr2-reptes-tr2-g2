# Inventari de Canvis - Implementació IA

Aquest document llista tots els arxius i carpetes que han estat creats o modificats durant la implementació de les 4 idees d'Intel·ligència Artificial.

## 📂 Arxius i Carpetes Creats

### Backend (Lògica)
*   `apps/api/src/services/assignment.solver.ts` (Idea 1)
*   `apps/api/src/services/auto-assignment.service.ts` (Idea 1)
*   `apps/api/src/services/nlp.service.ts` (Idea 2)
*   `apps/api/src/services/risk-analysis.service.ts` (Idea 3)
*   `apps/api/src/services/vision.service.ts` (Idea 4)
*   `apps/api/src/controllers/evaluation.controller.ts` (Idea 2)
*   `apps/api/src/routes/evaluation.routes.ts` (Idea 2)


### Documentació
*   `doc/AI_features/README.md`
*   `doc/AI_features/walkthrough.md`
*   `doc/AI_features/FILE_INVENTORY.md` (Aquest arxiu)
*   `doc/AI_features/DOCUMENTACION_IA_COMPLETA.md` (Guia consolidada de les 4 idees)
*   `doc/AI_features/AI_RECONSTRUCTION_PROMPT.md` (Prompt mestre de recuperació)

---

## 📝 Arxius Modificats

### Base de Dades i Configuració
*   `apps/api/prisma/schema.prisma`: Afegits camps per a assignació de grups (`grup`) i relacions 1:N.
*   `tsconfig.json`: Reparada configuració arrel.
*   `package.json`: Afegida dependència `expo` per resoldre conflictes de tipus.

### Controladores i Rutes (Backend)
*   `apps/api/src/controllers/assignacio.controller.ts`: Afegits mètodes `generateAutomaticAssignments` i `validateDocumentUpload`.
*   `apps/api/src/controllers/stats.controller.ts`: Afegit mètode `runRiskAnalysis`.
*   `apps/api/src/routes/assignacio.routes.ts`: Afegits endpoints.
*   `apps/api/src/routes/stats.routes.ts`: Afegits endpoints.
*   `apps/api/src/routes/index.ts`: Registrada ruta d'avaluació.
