# Documentació Tècnica Backend - Programa Iter

Aquest document descriu l'arquitectura i les millors pràctiques implementades al backend per assegurar un sistema professional, robust i escalable.

## Arquitectura del Servidor

El backend està construït sobre **Node.js** utilitzant el framework **Express** i **TypeScript**. S'ha seguit el patró de disseny de **Controladors i Rutes** per separar la lògica de negoci de la definició dels endpoints.

### 🚀 Característiques Professionals Implementades

### 1. Gestió de Logs i Monitorització
S'utilitza **Winston** com a motor de logging estructurat. Això permet separar els logs per nivells (info, error) i facilita la depuració en producció.
- **Arxiu**: `src/lib/logger.ts`
- **Ús**: `logger.info(...)`, `logger.error(...)`

### 2. Gestió Global d'Errors i Excepcions
Hem implementat un middleware de captura d'errors global. Gràcies a la llibreria `express-async-errors`, no és necessari envolcallar cada controlador en blocs `try/catch`. 
Qualsevol error llançat a l'aplicació és capturat pel [ErrorHandler](src/middlewares/errorHandler.ts), que el formateja de manera segura per al client (ocultant detalls sensibles en producció).

### 3. Validació de Dades (Type Safety Estesa)
Utilitzem **Zod** per validar totes les entrades del servidor (`body`, `params`, `query`). 
- **Middlewares**: `validateData(schema)` intercepta la petició i assegura que els tipus i restriccions es compleixen abans que la lògica de negoci s'executi.
- **Esquemes**: Definits a `src/schemas/`, centralitzen les regles de validació (longitud de strings, rangs numèrics, enums, etc.).

### 4. Capa de Dades i Rendiment
L'accés a la base de dades **PostgreSQL** es realitza a través de **Prisma ORM**.
- **Indexació**: S'han afegit índexs estratègics en taules de gran volum com `assignacions` i `logs_auditoria` per accelerar les consultes de cerca i filtratge.
- **Consultes Paral·leles**: S'utilitza `Promise.all` per disparar múltiples peticions a la base de dades simultàniament, optimitzant el temps de resposta en endpoints complexos com el calendari.
- **Paginació Estàndard**: Tots els endpoints de llistat (`/tallers`, `/centres`, `/peticions`, `/fases`) retornen una estructura estandaritzada:
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

### 5. Seguretat Base
- **JWT (JSON Web Tokens)**: Implementat per a l'autenticació d'usuaris.
- **RBAC (Role Based Access Control)**: Middlewares específics (`isAdmin`, `isCoordinator`, `authenticateToken`) protegeixen les rutes segons els privilegis de l'usuari.

## Estructura de Carpetes

- `src/controllers/`: Lògica de negoci i gestió de la base de dades.
- `src/routes/`: Definició d'endpoints i aplicació de middlewares.
- `src/middlewares/`: Funcions d'intercepció (Auth, Error, Validation).
- `src/schemas/`: Definicions d'esquemes Zod per validació.
- `src/lib/`: Singletons i utilitats (PrismaClient, Logger).
- `prisma/`: Esquema de base de dades i migracions.
