# Documentació Mestra: Intel·ligència Artificial (Programa Enginy)

Aquest document és la font única de veritat per a les funcionalitats d'Intel·ligència Artificial integrades a la plataforma Iter. Consolida l'arquitectura, guies d'implementació, inventari d'arxius i manual de proves.

---

## 📑 Resum Executiu
S'han implementat **4 prototips d'IA** dissenyats per maximitzar el valor operatiu del Programa Enginy:
1.  **Motor d'Assignació IA**: Optimització combinatòria per al repartiment d'alumnes.
2.  **Assistent de Veu / NLP**: Processament de llenguatge natural per a avaluacions ràpides.
3.  **Detecció Predictiva de Risc**: Sistema d'alerta primerenca d'abandonament escolar.
4.  **Validació Vision**: Pre-validació automàtica de documents tècnics (PDF).

---

## 🛠️ Arquitectura Tècnica
El sistema segueix un patró de **Serveis Modulars** per garantir l'escalabilitat i facilitat de manteniment.

### 📂 Mapa d'Arxius (Inventari)
#### Backend (Lògica i Serveis)
-   `apps/api/src/services/assignment.solver.ts`: Algorisme Greedy per a assignació.
-   `apps/api/src/services/auto-assignment.service.ts`: Orquestrador de base de dades per al motor IA.
-   `apps/api/src/services/nlp.service.ts`: Motor d'anàlisi de text basat en patrons.
-   `apps/api/src/services/risk-analysis.service.ts`: Lògica de scoring i triggers de notificació.
-   `apps/api/src/services/vision.service.ts`: Processament simulat d'OCR/Vision.
-   `apps/api/src/controllers/evaluation.controller.ts`: Pont entre NLP i la persistència de notes.

#### Frontend (Interfície)
-   `apps/web/app/admin/ai-lab/page.tsx`: Zona interactiva de proves (Laboratori).
-   `apps/web/services/evaluationService.ts`: Client API per a l'assistent de veu.
-   `apps/web/services/assignacioService.ts`: Extensions per al motor IA i Vision.

---

## 🚀 Guia de Funcionalitats (Detall Tècnic)

### 1. Motor d'Assignació Automàtica (IA Simbòlica)
**Problema**: Dificultat per barrejar alumnes de diferents centres en grups de màxim 16.
-   **Lògica**: Algorisme de "Satisfacció de Restriccions". Divideix peticions en grups, garantint heterogeneïtat (màx. 4 alumnes del mateix institut per grup).
-   **Base de Dades**: S'ha modificat `Assignacio` per suportar relacions 1:N amb `Peticio` i el camp `grup`.
-   **Punt d'Accés**: `/admin/solicitudes` -> Botó blau **"Motor IA (Optimitza)"**.

### 2. Assistent de Veu per Avaluació (NLP)
**Problema**: Càrrega administrativa dels professors durant els tallers.
-   **Lògica**: Extracció d'entitats (assistència i notes) mitjançant anàlisi de patrons en cadenes de text enviades des del mòbil.
-   **Impacte**: Actualitza automàticament els registres d'`Assistencia` i `AvaluacioCompetencial`.
-   **Punt d'Accés**: `/admin/ai-lab` -> Mòdul "Assistent de Veu".

### 3. Detecció Predictiva de Risc (Sistema Expert)
**Problema**: Identificació tardana d'alumnes desmotivats.
-   **Lògica**: Scoring dinàmic basat en:
    -   Absències recents (+40 pts).
    -   Retards continuats (+10 pts).
    -   Baix rendiment competencial (+10 pts).
-   **Acció**: Si el risc és > 50%, es dispara una **Notificació Interna** al tutor del centre.
-   **Punt d'Accés**: `/admin/stats` -> Botó **"Executar Anàlisi de Risc IA"**.

### 4. Validació Automàtica de Documents (Vision)
**Problema**: Gestió manual de milers de PDFs d'Acords Pedagògics.
-   **Lògica**: Simulació de visió per computador per detectar la presència de firmes i validesa del format.
-   **Seguretat**: Ús de `multer` en memòria per anàlisi instantània sense persistència d'arxius erronis.
-   **Punt d'Accés**: `/admin/ai-lab` -> Mòdul "Vision".

---

## 🧪 Manual de Proves (Frontend)

He habilitat tres punts clau per verificar el funcionament:

1.  **Laboratori IA** (`/admin/ai-lab`):
    -   Prova l'**Assistent de Veu** escrivint frases com *"Marc ha arribat tard però avui ha treballat de 10"*. Veuràs com la IA separa el retard de la nota.
    -   Prova **Vision** pujant qualsevol PDF per veure el resultat de la validació simulada.

2.  **Gestió de Sol·licituds** (`/admin/solicitudes`):
    -   Fes clic en **"Motor IA (Optimitza)"**. Veuràs com el sistema reparteix als alumnes de les peticions aprovades en els grups corresponents de forma equilibrada.

3.  **Estadístiques Avançades** (`/admin/stats`):
    -   Fes clic en **"Executar Anàlisi de Risc IA"**. Introdueix un ID (ex: 1). El sistema calcularà la seva probabilitat d'abandonament i generarà una alerta si és necessari.

---

## ❓ Preguntes Freqüents
-   **És IA real o regles?**: Per assegurar **transparència i cost 0**, hem optat per una combinació d'**IA Simbòlica (Optimització)** i **Sistemes Experts**. No depenen d'APIs externes de pagament (com OpenAI), el que fa al sistema 100% privat i ràpid.
-   **Es pot escalar?**: Sí. L'arquitectura modular permet substituir el `NLPService` o el `VisionService` per models de Deep Learning (com LLMs o OCRs avançats) en el futur amb un sol canvi d'arxiu.

---
© 2026 - Consorci d'Educació de Barcelona. Projecte Enginy.
