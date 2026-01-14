# 🚀 Enginy Monorepo (v2.0)

Bienvenido al núcleo del ecosistema **Enginy**. Esta es una infraestructura moderna basada en un **Monorepo** gestionado con **Turborepo**, diseñada para ser escalable, rápida y fácil de desplegar.

> **⚠️ ACTUALIZACIÓN IMPORTANTE (Enero 2026):**
> Hemos migrado el backend de MongoDB a **PostgreSQL + Prisma**. Si vienes de una versión antigua, revisa la sección de *Configuración Inicial*.

## 🌐 Entorno de Producción

El ecosistema está totalmente automatizado y expuesto de forma segura a través de **Cloudflare Tunnels**:

* **💻 Web UI (Cliente/Admin):** [enginy.kore29.com](https://enginy.kore29.com)
* **🔌 API Gateway:** [api-enginy.kore29.com](https://api-enginy.kore29.com)



## 🏗️ Estructura del Proyecto

Utilizamos una arquitectura de **espacios de trabajo (workspaces)** para compartir código eficientemente:

* **`apps/web`**: Aplicación unificada de **Next.js** que gestiona tanto la interfaz de cliente como el panel de administración.
* **`apps/api`**: Backend robusto en **Node.js** con **Express y Prisma ORM**.
* **`apps/mobile`**: Aplicación nativa multiplataforma con **Expo** (iOS/Android).
* **`packages/`**: Librerías compartidas (UI, configuraciones, tipos).



## 🛠️ Stack Tecnológico

| Componente | Tecnología | Despliegue |
|  |  |  |
| **Frontend Web** | Next.js (React) + Tailwind CSS | Docker (Standalone mode) |
| **Backend API** | Node.js + Express + **Prisma ORM** | Docker |
| **Base de Datos** | **PostgreSQL 15** | Docker (Local) / Cloud (Prod) |
| **App Móvil** | Expo (React Native) | Nativo (Android/iOS) |
| **Orquestador** | **Turborepo** | Pipeline CI/CD |
| **Admin BBDD** | **Adminer** | Docker (:8080) |



## ⚡ Configuración Inicial (Quick Start)

Antes de levantar Docker, necesitas configurar las variables de entorno.

### 1. Variables de Entorno

Hemos unificado la configuración en un archivo de ejemplo.

1. Copia el archivo `.env.example` a `.env` en la raíz.
2. Abre `.env.example` y sigue las instrucciones para copiar/pegar las secciones correspondientes en:
* `apps/api/.env` (Backend)
* `apps/web/.env` (Frontend Web)
* `apps/mobile/.env` (Frontend Mobile)



### 2. Levantar Infraestructura

Para levantar Base de Datos, API, Web y Adminer con **Hot-Reloading**:

```bash
docker-compose up --build

```

### 3. Poblar Base de Datos (Seed)

La primera vez que arranques, la base de datos estará vacía. Ejecuta este script para crear las tablas e insertar datos de prueba (Talleres, Centros, Usuarios):

```bash
docker-compose exec api npx prisma db seed

```



## 📍 Endpoints y Accesos Locales

Una vez levantado Docker, tienes acceso a estos servicios:

| Servicio | URL Local | Descripción |
|  |  |  |
| **Web App** | `http://localhost:3000` | Interfaz de Usuario |
| **API REST** | `http://localhost:4000/api` | Backend Principal |
| **Adminer** | `http://localhost:8080` | Visor SQL Visual |

### 🔑 Credenciales de Prueba

**Usuarios de la App:**

* **Admin Global:** `admin@enginy.com` / `admin123`
* **Profesor (Brossa):** `profe.brossa@example.com` / `password123`
* **Profesor (Milà):** `profe.mila@example.com` / `password123`

**Acceso a Base de Datos (Adminer):**

* **Sistema:** PostgreSQL
* **Servidor:** `db` (¡Importante! no usar localhost)
* **Usuario:** `postgres`
* **Contraseña:** `root`
* **Base de Datos:** `enginy_db`



## 🐳 Flujo de Trabajo con Docker

Este proyecto utiliza **Multi-stage builds** para optimizar el rendimiento.

### 💻 Desarrollo

El `docker-compose.yml` monta volúmenes locales. Cualquier cambio que hagas en `src/` se reflejará inmediatamente (Hot-Reload) sin reconstruir el contenedor.

### 🚀 Producción

Para simular el entorno real (imágenes ligeras y optimizadas):

```bash
docker-compose -f docker-compose.prod.yml up --build -d

```

> [!NOTE]
> Este comando ejecuta `turbo prune`, eliminando dependencias de desarrollo y reduciendo el peso de la imagen final drásticamente.



## 📱 Desarrollo Mobile (Expo)

La aplicación móvil se ejecuta fuera de Docker para permitir la conexión con el emulador o dispositivo físico.

1. Asegúrate de que tu `apps/mobile/.env` tiene la IP local de tu PC (no localhost).
2. Lanza el proyecto:
```bash
npx turbo dev --filter=mobile

```


3. Escanea el QR con **Expo Go**.



## 🔄 Estándares de Desarrollo

### **Estrategia de GitFlow**

* **`main`**: Producción estable.
* **`dev`**: Integración (Docker + Postgres). **¡No hacer push directos sin validar!**
* **`feature/*`**: Ramas para nuevas funcionalidades.

### **Base de Datos (Prisma)**

Si modificas el archivo `schema.prisma`:

1. Actualiza la BBDD local: `npx prisma db push`
2. Regenera el cliente: `npx prisma generate`



## 🗺️ Roadmap Actualizado

* [x] Migración a **Monorepo (Turbo)**.
* [x] Migración a **PostgreSQL + Prisma**.
* [x] Dockerización completa (Web + API + DB + Adminer).
* [ ] Implementación de Lógica de Asignación Automática.
* [ ] Autenticación JWT en Middleware.
* [ ] Documentación Swagger.



## 🔑 Documentación Técnica

Para detalles sobre el despliegue en Proxmox o guías de conexión:

👉 **[Documentación Técnica (DOCS.md)](https://www.google.com/search?q=./doc/DOCS.md)**
👉 **[Guía de Uso (USAGE.md)](https://www.google.com/search?q=./doc/USAGE.md)**