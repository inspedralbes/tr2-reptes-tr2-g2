# 🤖 Documentación Master: Inteligencia Artificial (Programa Enginy)

Este documento es la fuente única de verdad para las funcionalidades de Inteligencia Artificial integradas en la plataforma Iter. Consolida la arquitectura, guías de implementación, inventario de archivos y manual de pruebas.

---

## 📑 Resumen Ejecutivo
Se han implementado **4 prototipos de IA** diseñados para maximizar el valor operativo del Programa Enginy:
1.  **Motor de Asignación IA**: Optimización combinatoria para el reparto de alumnos.
2.  **Asistente de Voz / NLP**: Procesamiento de lenguaje natural para evaluaciones rápidas.
3.  **Detección Predictiva de Riesgo**: Sistema de alerta temprana de abandon escolar.
4.  **Validación Vision**: Pre-validación automática de documentos técnicos (PDF).

---

## 🛠️ Arquitectura Técnica
El sistema sigue un patrón de **Servicios Modulares** para garantizar la escalabilidad y facilidad de mantenimiento.

### 📂 Mapa de Archivos (Inventario)
#### Backend (Lógica y Servicios)
-   `apps/api/src/services/assignment.solver.ts`: Algoritmo Greedy para asignación.
-   `apps/api/src/services/auto-assignment.service.ts`: Orquestador de base de datos para el motor IA.
-   `apps/api/src/services/nlp.service.ts`: Motor de análisis de texto basado en patrones.
-   `apps/api/src/services/risk-analysis.service.ts`: Lógica de scoring y triggers de notificación.
-   `apps/api/src/services/vision.service.ts`: Procesamiento simulado de OCR/Vision.
-   `apps/api/src/controllers/evaluation.controller.ts`: Puente entre NLP y la persistencia de notas.

#### Frontend (Interfaz)
-   `apps/web/app/admin/ai-lab/page.tsx`: Zona interactiva de pruebas (Laboratorio).
-   `apps/web/services/evaluationService.ts`: Cliente API para el asistente de voz.
-   `apps/web/services/assignacioService.ts`: Extensiones para el motor IA y Vision.

---

## 🚀 Guía de Funcionalidades (Detalle Técnico)

### 1. Motor de Asignación Automática (IA Simbólica)
**Problema**: Dificultad para mezclar alumnos de distintos centros en grupos de máximo 16.
-   **Lógica**: Algoritmo de "Satisfacción de Restricciones". Divide peticiones en grupos, garantizando heterogeneidad (máx. 4 alumnos del mismo instituto por grupo).
-   **Base de Datos**: Se ha modificado `Assignacio` para soportar relaciones 1:N con `Peticio` y el campo `grup`.
-   **Punto de Acceso**: `/admin/solicitudes` -> Botón azul **"Motor IA (Optimitza)"**.

### 2. Asistente de Voz para Evaluación (NLP)
**Problema**: Carga administrativa de los profesores durante los talleres.
-   **Lógica**: Extracción de entidades (asistencia y notas) mediante análisis de patrones en cadenas de texto enviadas desde el móvil.
-   **Impacto**: Actualiza automáticamente los registros de `Assistencia` y `AvaluacioCompetencial`.
-   **Punto de Acceso**: `/admin/ai-lab` -> Módulo "Asistente de Voz".

### 3. Detección Predictiva de Riesgo (Sistema Experto)
**Problema**: Identificación tardía de alumnos desmotivados.
-   **Lógica**: Scoring dinámico basado en:
    -   Ausencias recientes (+40 pts).
    -   Retrasos continuados (+10 pts).
    -   Bajo desempeño competencial (+10 pts).
-   **Acción**: Si el riesgo es > 50%, se dispara una **Notificación Interna** al tutor del centro.
-   **Punto de Acceso**: `/admin/stats` -> Botón **"Ejecutar Análisis de Riesgo IA"**.

### 4. Validación Automática de Documentos (Vision)
**Problema**: Gestión manual de miles de PDFs de Acuerdos Pedagógicos.
-   **Lógica**: Simulación de visión por computador para detectar la presencia de firmas y validez del formato.
-   **Seguridad**: Uso de `multer` en memoria para análisis instantáneo sin persistencia de archivos erróneos.
-   **Punto de Acceso**: `/admin/ai-lab` -> Módulo "Vision".

---

## 🧪 Manual de Pruebas (Frontend)

He habilitado tres puntos clave para verificar el funcionamiento:

1.  **Laboratorio IA** (`/admin/ai-lab`):
    -   Prueba el **Asistente de Voz** escribiendo frases como *"Marc ha llegado tarde pero hoy ha trabajado de 10"*. Verás cómo la IA separa el retardo de la nota.
    -   Prueba **Vision** subiendo cualquier PDF para ver el resultado de la validación simulada.

2.  **Gestión de Solicitudes** (`/admin/solicitudes`):
    -   Haz clic en **"Motor IA (Optimitza)"**. Verás cómo el sistema reparte a los alumnos de las peticiones aprobadas en los grupos correspondientes de forma equilibrada.

3.  **Estadísticas Avanzadas** (`/admin/stats`):
    -   Haz clic en **"Ejecutar Análisis de Riesgo IA"**. Introduce un ID (ej: 1). El sistema calculará su probabilidad de abandono y generará una alerta si es necesario.

---

## ❓ Preguntas Frecuentes
-   **¿Es IA real o reglas?**: Para asegurar **transparencia y coste 0**, hemos optado por una combinación de **IA Simbólica (Optimización)** y **Sistemas Expertos**. No dependen de APIs externas de pago (como OpenAI), lo que hace al sistema 100% privado y rápido.
-   **¿Se puede escalar?**: Sí. La arquitectura modular permite sustituir el `NLPService` o el `VisionService` por modelos de Deep Learning (como LLMs o OCRs avanzados) en el futuro con un solo cambio de archivo.

---
© 2026 - Consorci d'Educació de Barcelona. Proyecto Enginy.
