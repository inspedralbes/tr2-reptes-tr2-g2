# Guía de Implementación: Detección Predictiva de Riesgo

Esta guía describe los pasos técnicos para integrar el sistema de "Early Warning" para detectar alumnos con alto riesgo de abandono.

## Workflow Simplificado (Lógica de Riesgo)
El sistema ejecuta un análisis inteligente basado en patrones de comportamiento recientes:
1.  **Recopilación de Datos**: El sistema extrae las últimas 5 sesiones de asistencia y todas las evaluaciones competenciales del alumno.
2.  **Cálculo de Puntuación (Scoring)**: Aplica una fórmula ponderada:
    *   **Ausencias Recientes**: Si tiene 2 o más faltas injustificadas (+40 puntos).
    *   **Retrasos Recurrentes**: Si llega tarde 2 o más veces (+10 puntos).
    *   **Bajo Rendimiento**: Por cada competencia suspendida con menos de un 3 (+10 puntos).
3.  **Clasificación**: Suma los puntos (0 a 100).
    *   0-30: Riesgo Bajo.
    *   30-50: Riesgo Medio.
    *   50-80: **Riesgo Alto**.
    *   80-100: **RIESGO CRÍTICO**.
4.  **Acción**: Si el riesgo es Alto o Crítico, se crea automáticamente una **Notificación Urgente** para el tutor del instituto de procedencia.



## 1. Crear Servicio de Análisis (Backend)

**Archivo**: `apps/api/src/services/risk-analysis.service.ts`

Implementar la lógica de cálculo de riesgo.
-   **Entrada**: ID del estudiante.
-   **Salida**: Score (0-100) y Nivel de Riesgo (LOW, MEDIUM, HIGH, CRITICAL).
-   **Lógica**: Ver workflow arriba.

```typescript
export class RiskAnalysisService {
  async analyzeStudentRisk(studentId: number) {
     // ... Consultar asistencias ...
     // ... Calcular Score ...
     // ... Crear notificación si es necesario ...
     return { riskScore: 85, riskLevel: 'CRITICAL', ... };
  }
}
```

## 2. Integrar en Controlador de Estadísticas

**Archivo**: `apps/api/src/controllers/stats.controller.ts`

Añadir el método `runRiskAnalysis` que permite ejecutar el análisis bajo demanda.
-   **Modo Individual**: Si recibe `studentId`, analiza solo ese alumno (ej. al entrar en su perfil).
-   **Modo Batch**: Si no recibe ID, analiza a **todos** los alumnos activos del sistema (ej. proceso semanal).

## 3. Configurar Rutas de la API

**Archivo**: `apps/api/src/routes/stats.routes.ts`

Añadir el endpoint POST para activar el análisis.
```typescript
router.post('/risk-analysis', statsController.runRiskAnalysis);
```

## 4. Automatización (Opcional)

Para un entorno de producción, se recomienda configurar un **Cron Job** (e.g., con `node-cron`) que llame a este endpoint automáticamente cada **Viernes a las 15:00**, para tener las alertas listas antes del fin de semana.



## 5. Preguntas Frecuentes

### 1. ¿Qué IA utiliza?
Se clasifica como un **Sistema Experto Basado en Reglas** (Rule-Based Expert System).
*   **Similitud con Idea 1**: Sí, ambas son **IAs Simbólicas/Deterministas**. No usan redes neuronales "caja negra" (como GPT), sino lógica programada transparente.
*   **Diferencia**: La Idea 1 es de *Optimización* (busca la mejor combinación matemática), la Idea 3 es *Heurística* (aplica el conocimiento de un experto humano traducido a fórmulas). Básicamente, digitalizamos el criterio de un tutor experto.

### 2. ¿Los puntos se acumulan siempre o se reinician?
Depende del factor:
*   **Asistencia (Dinámico)**: Funciona como una **ventana móvil**. El sistema solo mira las **últimas 5 sesiones**. Si un alumno tuvo faltas hace dos meses pero ha venido correctamente las últimas semanas, su riesgo de asistencia **bajará a 0 automáticamente**. ¡El sistema premia la mejora!
*   **Evaluaciones (Acumulativo)**: Las notas bajas sí se acumulan durante el curso, porque indican una tendencia académica que no desaparece sola. Para bajar este riesgo, el alumno debe sacar buenas notas en las siguientes evaluaciones para compensar el promedio (o mejorar las competencias suspendidas).

### 3. ¿Cuándo se envían las alertas?
Las alertas se generan **en el momento que se ejecuta el análisis**. Si se configura automático (Cron Job), se enviarán una vez por semana. Si un profesor lo ejecuta manualmente desde el panel, es inmediato.

### 4. ¿Es legal analizar estos datos?
**Sí, y es necesario**. El sistema no usa datos sensibles personales (raza, religión, ideología), sino datos académicos objetivos (hacer "novillos", suspender) que ya forman parte del expediente del alumno. El objetivo es pedagógico (ayudarle a no abandonar), lo cual entra dentro de las funciones legítimas del centro educativo.

### 5. ¿El algoritmo tiene en cuenta problemas personales?
**No directamente**. El algoritmo es "ciego" a problemas personales no registrados. Solo ve **síntomas** (faltas, notas bajas). Sin embargo, al detectar el síntoma y avisar al tutor humano, este es quien investigará la causa real (problemas familiares, desmotivación, bullying) y actuará. La IA es el detector de humo, el tutor es el bombero.

---
