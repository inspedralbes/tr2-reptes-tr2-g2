# Visión General del Proyecto

Este documento es la guía central para el desarrollo del proyecto. Su objetivo es alinear al equipo en cuanto a tecnologías, flujos de trabajo y los próximos pasos a seguir.

## 1. Stack Tecnológico

A continuación se describe el conjunto de tecnologías seleccionadas para cada parte de la aplicación.

### Backend

-   **Runtime:** Node.js
-   **Framework:** Express.js
-   **Base de Datos:** MongoDB (a través del ODM Mongoose)
-   **Contenerización:** Docker y Docker Compose para un entorno de desarrollo consistente.
-   **Lenguaje:** JavaScript (ES6+)

### Frontend

-   **Estado:** **Por Definir.**
-   **Propuesta:** Se recomienda utilizar un framework moderno como **React**, **Vue** o **Svelte** para construir una Single Page Application (SPA). La elección final debe ser una de las primeras decisiones del equipo.
-   **Librería de Estilos:** Se podría usar **Tailwind CSS** para un desarrollo ágil o una librería de componentes como **Material-UI** (si se usa React) o **Bootstrap**.

## 2. Flujo de Trabajo (Workflow)

Para mantener el código organizado, limpio y funcional, se propone el siguiente flujo de trabajo.

### A. Gestión de Repositorio (Git)

Se utilizará un modelo de ramas basado en **GitFlow**:

-   `main`: Contendrá el código de producción estable. Solo se mezcla desde `develop` cuando se prepara una nueva versión.
-   `develop`: Es la rama principal de desarrollo. Aquí se integran todas las nuevas funcionalidades.
-   `feature/<nombre-feature>`: Cada nueva funcionalidad se desarrolla en su propia rama, que parte de `develop`. Ejemplo: `feature/user-authentication`.
-   `fix/<nombre-bug>`: Para correcciones de bugs urgentes. Parte de `main` o `develop` según la urgencia.

### B. Convención de Commits

Para tener un historial de cambios legible y automatizable, se **debe** seguir la convención de **Conventional Commits**.

-   **Formato:** `<tipo>(<ámbito>): <descripción>`
-   **Ejemplos:**
    -   `feat(api): add endpoint for user creation`
    -   `fix(db): correct validation error in taller model`
    -   `docs(readme): update project workflow section`
-   **Tipos comunes:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.


## 3. Infraestructura y Acceso a Datos

El entorno de bases de datos se encuentra alojado en un servidor **Proxmox** privado. Para garantizar la seguridad sin sacrificar la comodidad del equipo, utilizamos **Cloudflare Zero Trust** (Túneles TCP) con autenticación vía **GitHub**.

### 🔑 Requisitos de Acceso

1. Tener instalado `cloudflared` en tu máquina local.
* **Arch Linux:** `sudo pacman -S cloudflared`
* **macOS:** `brew install cloudflare/cloudflare/cloudflared`
* **Windows:** `winget install Cloudflare.cloudflared`


2. Estar en la lista de correos autorizados (contactar con el administrador).

### 🚀 Cómo conectarse

Para acceder a las bases de datos desde herramientas locales (**TablePlus**, **MongoDB Compass**, **DBeaver**), debes abrir un túnel local en tu terminal:

#### Para MariaDB (SQL)

```bash
cloudflared access tcp --hostname database-sql.kore29.com --listener localhost:3306

```

#### Para MongoDB (NoSQL)

```bash
cloudflared access tcp --hostname database-no-sql.kore29.com --listener localhost:27017

```

> **Nota:** Al ejecutar el comando, se abrirá una ventana en tu navegador. Inicia sesión con tu cuenta de **GitHub**. Una vez autorizado, la terminal mostrará `Ingress established`.

### ⚙️ Configuración en Clientes de DB

Una vez el túnel esté activo, configura tu cliente con estos parámetros:

| Parámetro | Valor |
| --- | --- |
| **Host** | `127.0.0.1` |
| **Puerto** | `27017` |
| **Usuario** | *Proporcionado por el administrador* |
| **Contraseña** | *Proporcionada por el administrador* |


## 4. Roadmap y Tareas Pendientes

Esta es una lista de tareas estructurales que **necesitamos abordar** para construir una base sólida para el proyecto.

### ☐ **Decisiones Arquitectónicas Clave**

-   [ ] **Definir el stack tecnológico del frontend** (React, Vue, Svelte, etc.).
-   [ ] Diseñar la arquitectura inicial del frontend (estructura de carpetas, manejo de estado).
-   [ ] Modelar los datos y las relaciones que faltan en la base de datos (ej. Usuarios, Roles).

### ☐ **Mejoras y Tareas del Backend**

-   [ ] **Implementar un framework de testing** (ej. **Jest** o **Mocha/Chai**) para pruebas unitarias y de integración.
-   [ ] **Añadir un Linter y Formateador** (ej. **ESLint** + **Prettier**) para mantener un estilo de código consistente.
-   [ ] **Crear documentación de la API** (ej. usando **Swagger/OpenAPI**) para que el frontend pueda consumirla fácilmente.
-   [ ] **Implementar autenticación y autorización** (ej. con **JWT - JSON Web Tokens**).
-   [ ] **Añadir middleware para manejo de errores centralizado** y logging de peticiones.
-   [ ] **Configurar un sistema de logging avanzado** (ej. **Winston** o **Pino**) para registrar eventos y errores en producción.

### ☐ **Infraestructura y Despliegue (DevOps)**

-   [ ] **Configurar un pipeline de Integración Continua (CI)** en GitHub Actions o GitLab CI. Esto debería correr los linters y tests en cada push a `develop`.
-   [ ] Preparar la configuración para el **Despliegue Continuo (CD)** a un entorno de staging o producción.


docker compose -f docker-compose.prod.yml exec backend npm run seed
