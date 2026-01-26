# Documentació Tècnica Completa: Funcionalitats IA - Programa Enginy

Aquest document consolida totes les guies d'implementació de les quatre funcionalitats d'Intel·ligència Artificial integrades en el projecte. Conté els workflows, canvis en base de dades, lògica de serveis i preguntes freqüents de cada mòdul.

---

#  Idea 1: Motor d'Assignació Automàtica

Aquesta guia detalla pas a pas com implementar el motor d'assignació automàtica d'alumnes a tallers (Modalitat C), garantint l'heterogeneïtat i el compliment de restriccions.

## Workflow Simplificat (Lògica "Slots First")
El sistema segueix aquests passos lògics:
1.  **Càlcul de Places**: Si hi ha 50 alumnes apuntats a un taller, el sistema calcula quants grups de 16 es necessiten (50/16 = 4 grups).
2.  **Creació de "Cubs"**: Es generen 4 grups buits (Group ID 1, 2, 3, 4).
3.  **Distribució**: L'algorisme pren alumne per alumne i busca el millor "cub" on encaixar-lo, respectant que no hi hagi més de 4 del mateix institut en aquest cub.

## 1. Modificació de Base de Dades (Prisma)
**Arxiu**: `apps/api/prisma/schema.prisma`

Necessitem permetre que una petició es divideixi en múltiples grups i distingir aquests grups.

1.  **Afegir camp `grup`**: En el model `Assignacio`, afegir `grup Int @default(1)`.
2.  **Relació 1:N**: Canviar la relació amb `Peticio`. Una petició pot tenir *moltes* assignacions (una per cada grup generat).

```prisma
// Abans
model Assignacio {
  id_peticio Int? @unique
  // ...
}

// Després
model Assignacio {
  id_peticio Int? // S'elimina @unique
  grup       Int  @default(1)
  // ...
}

model Peticio {
  // ...
  assignacions Assignacio[] // Canvia de Assignacio? a Assignacio[]
}
```

**Comando a executar**:
```bash
npx prisma generate
npx prisma db push
```

## 2. Implementar Algorisme d'Assignació (AI)
**Arxiu**: `apps/api/src/services/assignment.solver.ts`

Crear la classe `AssignmentSolver` que conté la lògica matemàtica.
-   **Rep**: Llista d'estudiants i "Slots" (buits de taller amb capacitat i ID de grup).
-   **Restriccions**: Màxim 16 alumnes per Slot i màxim 4 alumnes d'un mateix centre per Slot.
-   **Estratègia**: Algorisme Greedy Aleatori (ordena estudiants a l'atzar i busca el millor slot disponible per maximitzar barreja).
-   **Selecció Equitativa ("Round Robin")**: En cas que la demanda superi l'oferta de places, el sistema activa automàticament un mode de selecció just que assigna places rotativament entre centres (Ex: 1r del Centre A, 1r del Centre B, etc.) per evitar que un centre copin totes les places per "arribar primer".

## 3. Crear Servei d'Orquestració
**Arxiu**: `apps/api/src/services/auto-assignment.service.ts`

Aquest servei connecta la base de dades amb l'algorisme.
1.  Busca peticions aprovades (Modalitat C).
2.  Agrupa alumnes per Taller sol·licitat.
3.  Calcula quants grups necessaris (Total Estudiants / 16).
4.  Crida a `AssignmentSolver`.
5.  Guarda els resultats a BD creant registres a `Assignacio` i `Inscripcio`.

## 4. Exposar Endpoint a API
-   **Controlador**: `apps/api/src/controllers/assignacio.controller.ts` (`generateAutomaticAssignments`).
-   **Rutes**: `apps/api/src/routes/assignacio.routes.ts`.
-   **Endpoint**: `POST /api/assignacions/auto-generate`.

## 5. Ús
Per executar l'assignació automàtica, enviar una petició POST:
-   **URL**: `/api/assignacions/auto-generate`
-   **Header**: `Authorization: Bearer <token>`

## Preguntes Freqüents (Idea 1)
1.  **Quina IA utilitza?**: Utilitza una **IA Simbòlica d'Optimització** (Constraint Satisfaction Problem). No és una "xarxa neuronal", sinó un algorisme matemàtic que avalua combinacions per complir regles estrictes.
2.  **És automàtic o hi ha un botó?**: Funciona **amb un botó**. L'assignació es fa sota demanda quan l'administrador ho decideix.
3.  **Com verificar que funciona?**: Al panell de control, en veure la llista d'alumnes del taller, verificaràs que estan dividits en grups de màxim 16 i amb barreja d'instituts.

---

# 🎤 Idea 2: Assistent de Veu per Avaluació

Aquesta guia descriu els passos tècnics per integrar la funcionalitat de processament de veu/text per automatitzar l'avaluació competencial i el control d'assistència.

## Workflow Simplificat (Lògica NLP)
1.  **Recepció**: El professor dicta una frase: *"Juan ha arribat 10 minuts tard però està liderant molt bé el grup"*.
2.  **Transcripció**: El mòbil converteix l'àudio a text via STT natiu.
3.  **Anàlisi (Backend)**: El servei `NLPService` detecta patrons ("tard" -> `Retard`, "liderant" -> Competència Positiva).
4.  **Execució**: El sistema actualitza automàticament l'`Assistencia` i l'`AvaluacioCompetencial`.

## 1. Crear Servei NLP (Backend)
**Arxiu**: `apps/api/src/services/nlp.service.ts`
Busca paraules clau de puntualitat ("tard", "falta") i de competència ("ajuda", "lidera") per suggerir puntuacions.

## 2. Crear Controlador d'Avaluació
**Arxiu**: `apps/api/src/controllers/evaluation.controller.ts`
Aquest controlador busca la inscripció de l'alumne, fa `upsert` a `Assistencia` i crea el registre a `AvaluacioCompetencial` (vinculat a `AvaluacioDocent`).

## 3. Configurar Rutes de l'API
-   **Arxiu**: `apps/api/src/routes/evaluation.routes.ts`.
-   **Endpoint**: `POST /api/evaluation/voice-process`.
-   **Registre**: Assegurar-se d'incloure-ho a `apps/api/src/routes/index.ts`.

## 4. Ús des de Frontend (Simulació)
El frontend envia el `text`, `studentId`, `sessionId` i `assignacioId` a l'endpoint esmentat.

## Preguntes Freqüents i Limitacions (Idea 2)
1.  **I si hi ha dos "Juan"?**: El sistema requereix enviar el `studentId`. El professor dicta el text dins de la fitxa específica de l'alumne, evitant ambigüitat.
2.  **Com entén ironies?**: Aquesta versió utilitza paraules clau. Per a comprensió humana completa, es requeriria integrar un LLM (com GPT-4), la qual cosa té un cost per ús.
3.  **Funciona amb àudio gravat o text?**: L'API rep **text**. La conversió d'Àudio a Text la fa el mòbil del professor, la qual cosa és gratis i ràpida.

---

#  Idea 3: Detecció Predictiva de Risc

Aquesta guia descriu els passos tècnics per integrar el sistema de "Early Warning" per detectar alumnes amb alt risc d'abandonament.

## Workflow Simplificat (Lògica de Risc)
1.  **Recopilació**: Extreu les últimes 5 sessions d'assistència i avaluacions competencials.
2.  **Scoring**: 
    -   Absències (2+) -> +40 pts.
    -   Retards (2+) -> +10 pts.
    -   Baix rendiment (< 3) -> +10 pts per competència.
3.  **Classificació**: 0-30 Baix, 30-50 Mitjà, 50-80 Alt, 80-100 CRÍTIC.
4.  **Acció**: Genera una **Notificació Urgent** per al tutor de l'institut de procedència.

## 1. Crear Servei d'Anàlisi (Backend)
**Arxiu**: `apps/api/src/services/risk-analysis.service.ts`
Implementa la lògica de càlcul i disparament d'alertes.

## 2. Integrar en Controlador d'Estadístiques
**Arxiu**: `apps/api/src/controllers/stats.controller.ts`
Afegeix `runRiskAnalysis` per a execució individual o en lot (batch).

## 3. Configurar Rutes de l'API
**Arxiu**: `apps/api/src/routes/stats.routes.ts`
Endpoint: `POST /api/stats/risk-analysis`.

## 4. Automatització (Opcional)
Es recomana un **Cron Job** per executar aquesta anàlisi setmanalment (ex. Divendres tarda).

## Preguntes Freqüents (Idea 3)
1.  **Quina IA utilitza?**: Sistema Expert Basat en Regles. És lògica transparent i auditable.
2.  **Els punts es reinicien?**: L'assistència utilitza una **finestra mòbil** de 5 sessions. Si l'alumne millora, el risc baixa. Les avaluacions són acumulatives.
3.  **Quan s'envien alertes?**: En el moment de l'anàlisi.
4.  **És legal?**: Sí, utilitza dades acadèmiques objectives per a fins pedagògics.
5.  **L'algorisme veu problemes personals?**: No, només veu símptomes (faltes/notes). El tutor humà investiga la causa.

---

#  Idea 4: Validació Automàtica de Documents

Aquesta guia descriu els passos per integrar la validació mitjançant Visió per Computador (Simulada).

## Workflow Simplificat (Visió per Computador)
1.  **Pujada**: L'alumne puja l'Acord Pedagògic (PDF).
2.  **Escaneig**: El sistema analitza l'estructura i busca signatures a la "Signature Box".
3.  **Decisió**: Si és vàlid, el guarda. Si no, el rebutja informant de l'error (ex: "Falta signatura").

## 1. Crear Servei de Visió (Backend)
**Arxiu**: `apps/api/src/services/vision.service.ts`
Valida format, mida i simula la detecció de signatura analitzant patrons a l'arxiu.

## 2. Integrar en el Controlador
**Arxiu**: `apps/api/src/controllers/assignacio.controller.ts` (`validateDocumentUpload`).

## 3. Configurar Endpoint i Middleware
**Arxiu**: `apps/api/src/routes/assignacio.routes.ts`
Utilitza `multer` en memòria per a l'anàlisi instantània.

## Preguntes Freqüents (Idea 4)
1.  **Com valida realment?**: En el prototip és una simulació. En producció s'utilitzaria **AWS Textract** o **Google Document AI**.
2.  **Compara la signatura amb el DNI?**: No, només detecta presència d'una signatura per evitar documents buits o erronis.
3.  **Accepta fotos?**: No, la IA espera estructura de document PDF oficial.
