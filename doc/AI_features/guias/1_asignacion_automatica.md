# Guía de Implementación: Motor de Asignación AI

Esta guía detalla paso a paso cómo implementar el motor de asignación automática de alumnos a talleres (Modalidad C), garantizando la heterogeneidad y el cumplimiento de restricciones.

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

**Archivo**: `apps/api/src/services/assignment.solver.ts` (Nuevo)

Crear la clase `AssignmentSolver` que contiene la lógica matemática.
-   Recibe: Lista de estudiantes y "Slots" (huecos de taller con capacidad y ID de grupo).
-   Restricciones:
    -   Max 16 alumnos por Slot.
    -   Max 4 alumnos de un mismo centro por Slot.
-   Estrategia: Algoritmo Greedy Aleatorio (ordena estudiantes al azar y busca el mejor slot disponible para maximizar mezcla).

## 3. Crear Servicio de Orquestación

**Archivo**: `apps/api/src/services/auto-assignment.service.ts` (Nuevo)

Este servicio conecta la base de datos con el algoritmo.
1.  Busca peticiones aprobadas (Modalidad C).
2.  Agrupa alumnos por Taller solicitado.
3.  Calcula cuántos grupos necesarios (Total Estudiantes / 16).
4.  Llama a `AssignmentSolver`.
5.  Guarda los resultados en BD creando registros en `Assignacio` y `Inscripcio`.

## 4. Exponer Endpoint en API

**Controlador**: `apps/api/src/controllers/assignacio.controller.ts`
Añadir método `generateAutomaticAssignments` que instancia el servicio y devuelve el resultado.

**Rutas**: `apps/api/src/routes/assignacio.routes.ts`
Añadir la ruta POST:
```typescript
router.post('/auto-generate', authenticateToken, assignacioController.generateAutomaticAssignments);
```

## 5. Uso

Para ejecutar la asignación automática, enviar una petición POST:
-   **URL**: `/api/assignacions/auto-generate`
-   **Header**: `Authorization: Bearer <token>`
