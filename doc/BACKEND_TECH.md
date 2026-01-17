# Documentació Tècnica Backend - Programa Iter

Este documento describe la arquitectura y las mejores prácticas implementadas en el backend para asegurar un sistema profesional, robusto y escalable.

## Arquitectura del Servidor

El backend está construido sobre **Node.js** utilizando el framework **Express** y **TypeScript**. Se ha seguido el patrón de diseño de **Controladores y Rutas** para separar la lógica de negocio de la definición de los endpoints.

### 🚀 Características Profesionales Implementadas

### 1. Gestión de Logs y Monitorización
Se utiliza **Winston** como motor de logging estructurado. Esto permite separar los logs por niveles (info, error) y facilita la depuración en producción.
- **Archivo**: `src/lib/logger.ts`
- **Uso**: `logger.info(...)`, `logger.error(...)`

### 2. Manejo Global de Errores y Excepciones
Hemos implementado un middleware de captura de errores global. Gracias a la librería `express-async-errors`, no es necesario envolver cada controlador en bloques `try/catch`. 
Cualquier error lanzado en la aplicación es capturado por el [ErrorHandler](src/middlewares/errorHandler.ts), que lo formatea de manera segura para el cliente (ocultando detalles sensibles en producción).

### 3. Validación de Datos (Type Safety Extendida)
Utilizamos **Zod** para validar todas las entradas del servidor (`body`, `params`, `query`). 
- **Middlewares**: `validateData(schema)` intercepta la petición y asegura que los tipos y restricciones se cumplen antes de que la lógica de negocio se ejecute.
- **Esquemas**: Definidos en `src/schemas/`, centralizan las reglas de validación (longitud de strings, rangos numéricos, enums, etc.).

### 4. Capa de Datos y Rendimiento
El acceso a la base de datos **PostgreSQL** se realiza a través de **Prisma ORM**.
- **Indexación**: Se han añadido índices estratégicos en tablas de gran volumen como `assignacions` y `logs_auditoria` para acelerar las consultas de búsqueda y filtrado.
- **Consultas Paralelas**: Se utiliza `Promise.all` para disparar múltiples peticiones a la base de datos simultáneamente, optimizando el tiempo de respuesta en endpoints complejos como el calendario.
- **Paginación Estándar**: Todos los endpoints de listado (`/tallers`, `/centres`, `/peticions`, `/fases`) devuelven una estructura estandarizada:
  ```json
  {
    "data": [...],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
  ```

### 5. Seguridad Base
- **JWT (JSON Web Tokens)**: Implementado para la autenticación de usuarios.
- **RBAC (Role Based Access Control)**: Middlewares específicos (`isAdmin`, `isCoordinator`, `authenticateToken`) protegen las rutas según los privilegios del usuario.

## Estructura de Carpetas

- `src/controllers/`: Lógica de negocio y manejo de la base de datos.
- `src/routes/`: Definición de endpoints y aplicación de middlewares.
- `src/middlewares/`: Funciones de interceptación (Auth, Error, Validation).
- `src/schemas/`: Definiciones de esquemas Zod para validación.
- `src/lib/`: Singletons y utilidades (PrismaClient, Logger).
- `prisma/`: Esquema de base de datos y migraciones.
