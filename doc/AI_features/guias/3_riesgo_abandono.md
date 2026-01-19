# Guía de Implementación: Detección Predictiva de Riesgo

Esta guía describe los pasos técnicos para integrar el sistema de "Early Warning" para detectar alumnos con riesgo de abandono.

## 1. Crear Servicio de Análisis (Backend)

**Archivo**: `apps/api/src/services/risk-analysis.service.ts`

Implementar la lógica de cálculo de riesgo.
-   **Entrada**: ID del estudiante.
-   **Salida**: Score (0-100) y Nivel de Riesgo (LOW, MEDIUM, HIGH, CRITICAL).
-   **Lógica**:
    -   Consultar `Assistencia` (últimas 5 sesiones).
    -   Sumar puntos por ausencias injustificadas (+40%) y retrasos (+10%).
    -   Consultar `AvaluacioCompetencial`.
    -   Sumar puntos por evaluaciones bajas (< 3).
    -   Si Riesgo > 80%, invocar `createNotificacioInterna`.

```typescript
export class RiskAnalysisService {
  async analyzeStudentRisk(studentId: number) {
     // ... Fetch prisma.assistencia ...
     // ... Calculate Score ...
     // ... Trigger Alert if needed ...
     return { riskScore: 85, riskLevel: 'CRITICAL', ... };
  }
}
```

## 2. Integrar en Controlador de Estadísticas

**Archivo**: `apps/api/src/controllers/stats.controller.ts`

Añadir el método `runRiskAnalysis` que permite ejecutar el análisis bajo demanda.
-   **Modo Individual**: Si recibe `studentId`, analiza solo ese alumno.
-   **Modo Batch**: Si no recibe ID, busca todos los `id_alumne` que tengan asistencia registrada y ejecuta el análisis para cada uno (bucle iterativo).

## 3. Configurar Rutas de la API

**Archivo**: `apps/api/src/routes/stats.routes.ts`

Añadir el endpoint POST para activar el análisis.
```typescript
router.post('/risk-analysis', statsController.runRiskAnalysis);
```

## 4. Automatización (Opcional)

Para un entorno de producción, se recomienda configurar un **Cron Job** (e.g., con `node-cron` o infraestructura cloud) que llame a este endpoint o a la función del servicio cada semana (ej: Viernes a las 16:00).

## 5. Uso y Verificación

**Petición**:
-   `POST /api/stats/risk-analysis`
-   Body: `{}` (para todos) o `{ "studentId": 123 }`.

**Respuesta**:
Devuelve una lista de los alumnos detectados como riesgo ALTO o CRÍTICO.
