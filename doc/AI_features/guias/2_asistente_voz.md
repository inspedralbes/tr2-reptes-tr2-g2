# Guía de Implementación: Asistente de Voz para Evaluación

Esta guía describe los pasos técnicos para integrar la funcionalidad de procesado de voz/texto para automatizar la evaluación competencial y el control de asistencia.

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

Para usar esta funcionalidad, el frontend (o Postman) debe enviar:
-   **Endpoint**: `POST /api/evaluation/voice-process`
-   **Body**:
    ```json
    {
      "text": "El alumno ha llegado tarde pero ha demostrado gran iniciativa.",
      "studentId": 10,
      "sessionId": 1,
      "assignacioId": 5
    }
    ```
-   **Resultado**: La asistencia se marca como "Retard" y se crea una evaluación positiva de competencia.
