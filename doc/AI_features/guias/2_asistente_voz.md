# Guía de Implementación: Asistente de Voz para Evaluación

Esta guía describe los pasos técnicos para integrar la funcionalidad de procesado de voz/texto para automatizar la evaluación competencial y el control de asistencia.

## Workflow Simplificado (Lógica NLP)
El sistema sigue estos pasos para procesar la voz del profesor:
1.  **Recepción**: El profesor dicta una frase: *"Juan ha llegado 10 minutos tarde pero está liderando muy bien el grupo"*.
2.  **Transcripción**: El móvil convierte el audio a texto (Speech-to-Text nativo del dispositivo).
3.  **Análisis (Backend)**: El servicio `NLPService` recibe el texto y busca patrones:
    *   Detecta "tarde" -> Entiende que es una incidencia de **Puntualidad** (`Retard`).
    *   Detecta "liderando" -> Entiende que es una competencia **Transversal Positiva**.
4.  **Ejecución**: El sistema busca al alumno "Juan" en la sesión actual, marca su asistencia como "Retraso" en la base de datos y le pone un 5 en "Liderazgo".

---

## 1. Crear Servicio NLP (Backend)

**Archivo**: `apps/api/src/services/nlp.service.ts`

Implementar la lógica de análisis de texto.
-   **Entrada**: Texto transcrito (string).
-   **Salida**: Objeto con estado de asistencia (`Retard`, `Present`, etc.) y evaluación competencial si aplica.
-   **Lógica**:
    -   Buscar palabras clave de puntualidad: "tarde" -> `Retard`, "falta" -> `Absencia`.
    -   Buscar palabras clave de competencia: "ayuda", "lidera" -> Sugerir puntuación (5) en competencia Transversal.

```typescript
export class NLPService {
  processText(text: string) {
    // ... lógica de detección ...
    return { attendanceStatus: '...', competenceUpdate: { ... } };
  }
}
```

## 2. Crear Controlador de Evaluación

**Archivo**: `apps/api/src/controllers/evaluation.controller.ts`

Este controlador actúa como intermediario:
1.  Recibe el texto y el ID del alumno/sesión.
2.  Llama al `NLPService`.
3.  **Actualiza DB**:
    -   Busca la inscripción del alumno.
    -   Hace `upsert` en la tabla `Assistencia` con el nuevo estado y el texto completo en `observacions`.
    -   Si el servicio NLP devuelve una competencia, crea un registro en `AvaluacioCompetencial`.

## 3. Configurar Rutas de la API

1.  **Nuevo Archivo de Rutas**: `apps/api/src/routes/evaluation.routes.ts`
    -   Definir el endpoint POST `/voice-process`.

2.  **Registrar en Router Principal**: `apps/api/src/routes/index.ts`
    -   Importar `evaluationRoutes`.
    -   Añadir `router.use('/evaluation', evaluationRoutes);`.

## 4. Uso desde Frontend (Simulación)

Para usar esta funcionalidad, el frontend envia:
-   **Endpoint**: `POST /api/evaluation/voice-process`

---

## Preguntas Frecuentes y Limitaciones

### 1. ¿Y si hay dos "Juan" en clase? (Ambigüedad)
El sistema **evita este problema por diseño**.
*   **Identificación por Contexto**: La API requiere que se envíe el `studentId`.
*   **Flujo de Usuario**: El profesor no dice "Pon un 5 a Juan". El profesor **entra en la ficha de Juan García** (o pulsa su foto) y luego dicta "Ha trabajado muy bien".
*   Así, el sistema ya sabe exactamente de quién se habla, aunque haya diez Juanes. La voz solo procesa el *qué*, no el *quién*.

### 2. ¿Cómo entiende el comportamiento complejo o ironía?
Esta versión Prototipo utiliza **Reglas por Palabras Clave**.
*   **Limitación**: Detecta palabras exactas ("tarde", "ayuda", "molesta"). No entiende context complejos o ironía (ej: "Vaya ayuda nos ha dado hoy...").
*   **Solución en Producción**: Para un entendimiento humano completo, se conectaría este servicio a una API de LLM (como OpenAI GPT-4). Se le enviaría el texto y el prompt: *"Analiza el sentimiento y extrae la nota"*. Esto entendería cualquier matiz, pero tiene un coste económico por uso.

### 3. ¿Funciona con audio grabado o texto?
La API recibe **texto**. La conversión de Audio a Texto la hace el móvil del profesor (Google/Siri). Esto es gratis, rápido y funciona offline en muchos casos.
