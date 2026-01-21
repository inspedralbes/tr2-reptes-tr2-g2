# Documentación Técnica Completa: Funcionalidades IA - Programa Enginy

Este documento consolida todas las guías de implementación de las cuatro funcionalidades de Inteligencia Artificial integradas en el proyecto. Contiene los workflows, cambios en base de datos, lógica de servicios y preguntas frecuentes de cada módulo.

---

#  Idea 1: Motor de Asignación Automática

Esta guía detalla paso a paso cómo implementar el motor de asignación automática de alumnos a talleres (Modalidad C), garantizando la heterogeneidad y el cumplimiento de restricciones.

## Workflow Simplificado (Lógica "Slots First")
El sistema sigue estos pasos lógicos:
1.  **Cálculo de Plazas**: Si hay 50 alumnos apuntados a un taller, el sistema calcula cuántos grupos de 16 se necesitan (50/16 = 4 grupos).
2.  **Creación de "Cubos"**: Se generan 4 grupos vacíos (Group ID 1, 2, 3, 4).
3.  **Distribución**: El algoritmo toma alumno por alumno y busca el mejor "cubo" donde encajarlo, respetando que no haya más de 4 del mismo instituto en ese cubo.

## 1. Modificación de Base de Datos (Prisma)
**Archivo**: `apps/api/prisma/schema.prisma`

Necesitamos permitir que una petición se divida en múltiples grupos y distinguir esos grupos.

1.  **Añadir campo `grup`**: En el modelo `Assignacio`, añadir `grup Int @default(1)`.
2.  **Relación 1:N**: Cambiar la relación con `Peticio`. Una petición puede tener *muchas* asignaciones (una por cada grupo generado).

```prisma
// Antes
model Assignacio {
  id_peticio Int? @unique
  // ...
}

// Después
model Assignacio {
  id_peticio Int? // Se elimina @unique
  grup       Int  @default(1)
  // ...
}

model Peticio {
  // ...
  assignacions Assignacio[] // Cambia de Assignacio? a Assignacio[]
}
```

**Comando a ejecutar**:
```bash
npx prisma generate
npx prisma db push
```

## 2. Implementar Algoritmo de Asignación (AI)
**Archivo**: `apps/api/src/services/assignment.solver.ts`

Crear la clase `AssignmentSolver` que contiene la lógica matemática.
-   **Recibe**: Lista de estudiantes y "Slots" (huecos de taller con capacidad y ID de grupo).
-   **Restricciones**: Máximo 16 alumnos por Slot y máximo 4 alumnos de un mismo centro por Slot.
-   **Estrategia**: Algoritmo Greedy Aleatorio (ordena estudiantes al azar y busca el mejor slot disponible para maximizar mezcla).

## 3. Crear Servicio de Orquestación
**Archivo**: `apps/api/src/services/auto-assignment.service.ts`

Este servicio conecta la base de datos con el algoritmo.
1.  Busca peticiones aprobadas (Modalidad C).
2.  Agrupa alumnos por Taller solicitado.
3.  Calcula cuántos grupos necesarios (Total Estudiantes / 16).
4.  Llama a `AssignmentSolver`.
5.  Guarda los resultados en BD creando registros en `Assignacio` y `Inscripcio`.

## 4. Exponer Endpoint en API
-   **Controlador**: `apps/api/src/controllers/assignacio.controller.ts` (`generateAutomaticAssignments`).
-   **Rutas**: `apps/api/src/routes/assignacio.routes.ts`.
-   **Endpoint**: `POST /api/assignacions/auto-generate`.

## 5. Uso
Para ejecutar la asignación automática, enviar una petición POST:
-   **URL**: `/api/assignacions/auto-generate`
-   **Header**: `Authorization: Bearer <token>`

## Preguntas Frecuentes (Idea 1)
1.  **¿Qué IA utiliza?**: Utiliza una **IA Simbólica de Optimización** (Constraint Satisfaction Problem). No es una "red neuronal", sino un algoritmo matemático que evalúa combinaciones para cumplir reglas estrictas.
2.  **¿Es automático o hay un botón?**: Funciona **con un botón**. La asignación se hace bajo demanda cuando el administrador lo decide.
3.  **¿Cómo verificar que funciona?**: En el panel de control, al ver la lista de alumnos del taller, verificarás que están divididos en grupos de máximo 16 y con mezcla de institutos.

---

# 🎤 Idea 2: Asistente de Voz para Evaluación

Esta guía describe los pasos técnicos para integrar la funcionalidad de procesado de voz/texto para automatizar la evaluación competencial y el control de asistencia.

## Workflow Simplificado (Lógica NLP)
1.  **Recepción**: El profesor dicta una frase: *"Juan ha llegado 10 minutos tarde pero está liderando muy bien el grupo"*.
2.  **Transcripción**: El móvil convierte el audio a texto vía STT nativo.
3.  **Análisis (Backend)**: El servicio `NLPService` detecta patrones ("tarde" -> `Retard`, "liderando" -> Competencia Positiva).
4.  **Ejecución**: El sistema actualiza automáticamente la `Assistencia` y la `AvaluacioCompetencial`.

## 1. Crear Servicio NLP (Backend)
**Archivo**: `apps/api/src/services/nlp.service.ts`
Busca palabras clave de puntualidad ("tarde", "falta") y de competencia ("ayuda", "lidera") para sugerir puntuaciones.

## 2. Crear Controlador de Evaluación
**Archivo**: `apps/api/src/controllers/evaluation.controller.ts`
Este controlador busca la inscripción del alumno, hace `upsert` en `Assistencia` y crea el registro en `AvaluacioCompetencial` (vinculado a `AvaluacioDocent`).

## 3. Configurar Rutas de la API
-   **Archivo**: `apps/api/src/routes/evaluation.routes.ts`.
-   **Endpoint**: `POST /api/evaluation/voice-process`.
-   **Registro**: Asegurarse de incluirlo en `apps/api/src/routes/index.ts`.

## 4. Uso desde Frontend (Simulación)
El frontend envía el `text`, `studentId`, `sessionId` y `assignacioId` al endpoint mencionado.

## Preguntas Frecuentes y Limitaciones (Idea 2)
1.  **¿Y si hay dos "Juan"?**: El sistema requiere enviar el `studentId`. El profesor dicta el texto dentro de la ficha específica del alumno, evitando ambigüedad.
2.  **¿Cómo entiende ironías?**: Esta versión usa palabras clave. Para comprensión humana completa, se requeriría integrar un LLM (como GPT-4), lo cual tiene un coste por uso.
3.  **¿Funciona con audio grabado o texto?**: La API recibe **texto**. La conversión de Audio a Texto la hace el móvil del profesor, lo cual es gratis y rápido.

---

#  Idea 3: Detección Predictiva de Riesgo

Esta guía describe los pasos técnicos para integrar el sistema de "Early Warning" para detectar alumnos con alto riesgo de abandono.

## Workflow Simplificado (Lógica de Riesgo)
1.  **Recopilación**: Extrae las últimas 5 sesiones de asistencia y evaluaciones competenciales.
2.  **Scoring**: 
    -   Ausencias (2+) -> +40 pts.
    -   Retrasos (2+) -> +10 pts.
    -   Bajo rendimiento (< 3) -> +10 pts por competencia.
3.  **Clasificación**: 0-30 Bajo, 30-50 Medio, 50-80 Alto, 80-100 CRÍTICO.
4.  **Acción**: Genera una **Notificación Urgente** para el tutor del instituto de procedencia.

## 1. Crear Servicio de Análisis (Backend)
**Archivo**: `apps/api/src/services/risk-analysis.service.ts`
Implementa la lógica de cálculo y disparo de alertas.

## 2. Integrar en Controlador de Estadísticas
**Archivo**: `apps/api/src/controllers/stats.controller.ts`
Añade `runRiskAnalysis` para ejecución individual o en lote (batch).

## 3. Configurar Rutas de la API
**Archivo**: `apps/api/src/routes/stats.routes.ts`
Endpoint: `POST /api/stats/risk-analysis`.

## 4. Automatización (Opcional)
Se recomienda un **Cron Job** para ejecutar este análisis semanalmente (ej. Viernes tarde).

## Preguntas Frecuentes (Idea 3)
1.  **¿Qué IA utiliza?**: Sistema Experto Basado en Reglas. Es lógica transparente y auditable.
2.  **¿Los puntos se reinician?**: La asistencia usa una **ventana móvil** de 5 sesiones. Si el alumno mejora, el riesgo baja. Las evaluaciones son acumulativas.
3.  **¿Cuándo se envían alertas?**: En el momento del análisis.
4.  **¿Es legal?**: Sí, usa datos académicos objetivos para fines pedagógicos.
5.  **¿El algoritmo ve problemas personales?**: No, solo ve síntomas (faltas/notas). El tutor humano investiga la causa.

---

#  Idea 4: Validación Automática de Documentos

Esta guía describe los pasos para integrar la validación mediante Visión por Computador (Simulada).

## Workflow Simplificado (Visión por Computador)
1.  **Subida**: El alumno sube el Acuerdo Pedagógico (PDF).
2.  **Escaneo**: El sistema analiza la estructura y busca firmas en la "Signature Box".
3.  **Decisión**: Si es válido, lo guarda. Si no, lo rechaza informando del error (ej: "Falta firma").

## 1. Crear Servicio de Visión (Backend)
**Archivo**: `apps/api/src/services/vision.service.ts`
Valida formato, tamaño y simula la detección de firma analizando patrones en el archivo.

## 2. Integrar en el Controlador
**Archivo**: `apps/api/src/controllers/assignacio.controller.ts` (`validateDocumentUpload`).

## 3. Configurar Endpoint y Middleware
**Archivo**: `apps/api/src/routes/assignacio.routes.ts`
Utiliza `multer` en memoria para el análisis instantáneo.

## Preguntas Frecuentes (Idea 4)
1.  **¿Cómo valida realmente?**: En el prototipo es una simulación. En producción se usaría **AWS Textract** o **Google Document AI**.
2.  **¿Compara la firma con el DNI?**: No, solo detecta presencia de una firma para evitar documentos vacíos o erróneos.
3.  **¿Acepta fotos?**: No, la IA espera estructura de documento PDF oficial.
