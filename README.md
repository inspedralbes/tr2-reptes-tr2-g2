# 🚀 Enginy Monorepo

Bienvenido al núcleo del ecosistema **Enginy**. Esta es una infraestructura moderna basada en un **Monorepo** gestionado con **Turborepo**, diseñada para ser escalable, rápida y fácil de desplegar.

## 🌐 Entorno de Producción

El ecosistema está totalmente automatizado y expuesto de forma segura a través de **Cloudflare Tunnels**:

* **💻 Web UI (Cliente/Admin):** [enginy.kore29.com](https://enginy.kore29.com)
* **🔌 API Gateway:** [api-enginy.kore29.com](https://api-enginy.kore29.com)

---

## 🏗️ Estructura del Proyecto

Utilizamos una arquitectura de **espacios de trabajo (workspaces)** para compartir código eficientemente:

* **`apps/web`**: Aplicación unificada de **Next.js** que gestiona tanto la interfaz de cliente como el panel de administración.
* **`apps/api`**: Backend robusto en **Node.js** que sirve como fuente de verdad para los datos.
* **`apps/mobile`**: Aplicación nativa multiplataforma con **Expo** (iOS/Android).
* **`packages/`**: Librerías compartidas (UI, configuraciones, tipos) que usan todas las aplicaciones anteriores.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Despliegue |
| --- | --- | --- |
| **Frontend Web** | Next.js (React) + Tailwind CSS | Docker (Standalone mode) |
| **Backend API** | Node.js + Express + Mongoose | Docker |
| **App Móvil** | Expo (React Native) | Nativo (Android/iOS) |
| **Orquestador** | **Turborepo** | Pipeline CI/CD |
| **Base de Datos** | MongoDB (External Server) | Conexión remota |

---

## 🐳 Flujo de Trabajo con Docker

Este proyecto utiliza **Multi-stage builds** para optimizar el rendimiento entre desarrollo y producción.

### 💻 Entorno de Desarrollo

Para levantar todo el backend y la web con **Hot-Reloading** (los cambios se ven al instante):

```bash
docker-compose up --build

```

> [!TIP]
> En este modo, Docker usa el target `builder`, manteniendo el entorno abierto para desarrollo activo.

### 🚀 Entorno de Producción

Para generar imágenes ultra-ligeras y optimizadas (usando el modo standalone de Next.js):

```bash
docker-compose -f docker-compose.prod.yml up --build -d

```

> [!NOTE]
> Este comando ejecuta el proceso de `pruning` de Turbo, eliminando dependencias innecesarias y reduciendo el peso de la imagen final.

---

## 📱 Desarrollo Mobile (Expo)

La aplicación móvil se ejecuta fuera de Docker para permitir la comunicación directa con dispositivos físicos y emuladores.

1. Instala dependencias en la raíz: `npm install`
2. Lanza el proyecto:
```bash
npx turbo dev --filter=mobile

```


3. Escanea el código QR con la app **Expo Go**.

---

## 🔄 Estándares de Desarrollo

### **Estrategia de GitFlow**

* **`main`**: Rama de producción. Cada *push* dispara el **Self-hosted Runner** en Proxmox.
* **`dev`**: Integración de nuevas funcionalidades y pruebas.
* **`feature/*`**: Ramas temporales para desarrollo de nuevas características.

### **Commit Convention**

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para un historial limpio:

* `feat:` Nuevas funcionalidades.
* `fix:` Corrección de errores.
* `docs:` Cambios en documentación.
* `refactor:` Mejoras de código que no añaden funciones.

---

## 🗺️ Roadmap

* [x] Migración total a **Turborepo** y estructura de Monorepo.
* [x] Dockerización profesional (Dev vs Prod).
* [ ] Implementación de **React Compiler** para optimización automática.
* [ ] Autenticación unificada mediante JWT & RBAC.
* [ ] Documentación de API mediante Swagger/OpenAPI.

---

## 🔑 Acceso y Despliegue

Para guías detalladas sobre la infraestructura en **Proxmox LXC** o conexión a bases de datos:

👉 **[Documentación Técnica (DOCS.md)](https://www.google.com/search?q=./doc/DOCS.md)**
👉 **[Guía de Uso y Conexión (USAGE.md)](https://www.google.com/search?q=./doc/USAGE.md)**

> [!IMPORTANT]
> El **Self-hosted runner** (`projects`) debe estar en estado **Idle** antes de realizar despliegues críticos a la rama `main`.

---

¿Te gusta cómo ha quedado? Si quieres, puedo ayudarte ahora a crear un script de **auto-despliegue** para que tu servidor de Proxmox se actualice solo cuando hagas push. *¿Te gustaría que lo hagamos?*