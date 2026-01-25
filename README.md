<div align="center">
  <h1 style="font-size: 3rem; font-weight: bold; margin-top: 20px;">ITER ECOSYSTEM</h1>
  
  **Infraestructura Monorepo Escalable para Centros Educativos**

  [![Turborepo](https://img.shields.io/badge/Orchestration-Turborepo-ef4444?style=flat-square&logo=turborepo)](https://turbo.build/)
  [![Next.js](https://img.shields.io/badge/Frontend-Next.js_16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![Node.js](https://img.shields.io/badge/Backend-Node.js_22-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
  [![Docker](https://img.shields.io/badge/Deploy-Docker_Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
  [![Prisma](https://img.shields.io/badge/ORM-Prisma-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

  [Demo en Vivo](https://iter.kore29.com) • [Documentación](./doc/DOCS.md) • [Reportar Bug](https://github.com/tu-repo/issues)
</div>

---

Benvingut al nucli de l'ecosistema **Iter**. Aquesta és una infraestructura moderna basada en un **Monorepo** gestionat amb **Turborepo**, dissenyada per ser escalable, ràpida i fàcil de desplegar.

> [!IMPORTANT]
> **ACTUALIZACIÓ ARQUITECTÒNICA (Gener 2026):**
> Hem implementat un nou flux d'arrencada seqüencial amb un servei de `setup` dedicat per garantir la màxima estabilitat i evitar conflictes de dependències en l'entorn Docker.

## 🌐 Entorn de Producció

L'ecosistema està totalment automatitzat i exposat de forma segura a través de **Cloudflare Tunnels**:

* **💻 Web UI (Client/Admin):** [iter.kore29.com](https://iter.kore29.com)
* **🔌 API Gateway:** [api-iter.kore29.com](https://api-iter.kore29.com)

## 🏗️ Estructura del Projecte

Utilitzem una arquitectura d'**espais de treball (workspaces)** per compartir codi eficientment:

* **`apps/web`**: Aplicació unificada de **Next.js 16** (amb Turbopack) que gestiona tant la interfície de client com el panell d'administració.
* **`apps/api`**: Backend robust en **Node.js 22** amb **Express, Prisma ORM** i execució optimitzada amb `tsx`.
* **`apps/mobile`**: Aplicació nativa multiplataforma amb **Expo** (iOS/Android).
* **`packages/shared`**: Llibreria de tipus i utilitats compartides entre el frontend i el backend.

## 🛠️ Stack Tecnològic

| Component | Tecnologia | Desplegament |
| :--- | :--- | :--- |
| **Frontend Web** | Next.js (React 19) + Tailwind CSS | Docker (Port 8002) |
| **Backend API** | Node.js + Express + **Prisma ORM** | Docker (Port 3000) |
| **Base de Dades** | **PostgreSQL 15** | Docker |
| **Orquestrador** | **Turborepo** | Gestió de Monorepo |
| **Admin BBDD** | **Adminer** | Docker (Port 8080) |

## ⚡ Configuració Inicial (Quick Start)

Gràcies a la nostra **Optimització Premium**, l'arrencada és totalment automatitzada.

### 1. Variables d'Entorn

1. Copia l'arxiu `.env.example` a `.env` a l'arrel.
2. Configura les variables necessàries per a cada aplicació a `apps/api/.env`, `apps/web/.env` i `apps/mobile/.env`.

### 2. Arrencada amb Docker

L'arrencada utilitza un servei intermediari de `setup` que instal·la dependències, genera el client de Prisma i pobla la base de dades automàticament.

```bash
# Arrencada estàndard
docker compose up

# Arrencada neta (reconstruint imatges i buidant volums)
docker compose down -v && docker compose up --build
```

## 📍 Endpoints i Accessos Locals

| Component         | Tecnologia                         | Desplegament       |
| :---------------- | :--------------------------------- | :----------------- |
| **Frontend Web** | Next.js (React 19) + Tailwind CSS  | Docker (Port 8002) |
| **Backend API** | Node.js + Express + **Prisma ORM** | Docker (Port 3000) |
| **Base de Dades** | **PostgreSQL 15** | Docker (Port 5432) |
| **Orquestrador** | **Turborepo** | Gestió de Monorepo |
| **Admin BBDD** | **Adminer** | Docker (Port 8080) |

### 🔑 Credencials de Prova (Seed)

El sistema pobla automàticament la base de dades amb les següents credencials per a totes les plataformes. Tots els usuaris utilitzen la contrasenya: **`Iter@1234`**.

| Rol | Usuari (Email) | Plataforma | Descripció |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@admin.com` | **Web** | Gestió global del programa, fases i sectors. |
| **Coordinador** | `coordinacion@brossa.cat` | **Web** | Coordinador de l'Institut Joan Brossa. |
| **Coordinador** | `coordinacion@pauclaris.cat` | **Web** | Coordinador de l'Institut Pau Claris. |
| **Professor (Brossa)** | `laura.martinez@brossa.cat` | **Mòbil** | Professor de l'Inst. Brossa. |
| **Professor (Brossa)** | `jordi.soler@brossa.cat` | **Mòbil** | Professor de l'Inst. Brossa. |
| **Professor (Claris)** | `anna.ferrer@pauclaris.cat` | **Mòbil** | Professor de l'Inst. Pau Claris. |
| **Professor (Claris)** | `marc.dalmau@pauclaris.cat` | **Mòbil** | Professor de l'Inst. Pau Claris. |

> [!TIP]
> Al seed hi ha creats 4 professors per centre amb noms reals. Altres exemples: `marta.vila@brossa.cat`, `laia.puig@pauclaris.cat`.
>
> **Alumnes**: També s'han creat alumnes amb noms reals (ex: `Pol Garcia`, `Paula Martí`) en lloc d'Alumne Generico.

> [!NOTE]
> Actualment el `seed` genera múltiples **peticions pendents** perquè puguis provar el flux d'assignació (Tetris o manual) directament des del panell d'administració.

## 🐳 Arquitectura Docker Seqüencial

Per evitar conflictes de lectura/escriptura de fitxers, hem implementat un flux seqüencial:

1. **`db`**: Aixeca PostgreSQL.
2. **`setup`**: Instal·la paquets, sincronitza la DB i executa el `seed`.
3. **`api` & `web`**: S'inicien només quan el `setup` ha finalitzat correctament.

## 🗺️ Roadmap i Documentació

* [x] Migració a **PostgreSQL + Prisma**.
* [x] Arrencada Seqüencial Premium.
* [x] Optimització amb **tsx** i **Turbopack**.
* [ ] **Motor d'Assignació (AI Constraint Satisfaction):** Algorisme d'optimització per garantir l'heterogeneïtat de grups i respectar límits complexos de places per centre.
* [x] **Assistent d'Avaluació per Veu (NLP):** Sistema *Speech-to-Text* que omple automàticament rúbriques i observacions analitzant el dictat del professor.
* [ ] **Predicció de Risc d'Abandonament:** Sistema *Early Warning* que alerta als tutors de possibles abandonaments basant-se en patrons d'assistència i baixada de rendiment.
* [ ] **Validació Documental (Computer Vision):** Verificació automàtica de signatures i estructura de documents (ex: Acords Pedagògics) al pujar-los.

### 📖 Documentació Tècnica Detallada

Per a més detalls, consulta els manuals a la carpeta `/doc`:

👉 **[Documentació Tècnica (DOCS.md)](https://www.google.com/search?q=./doc/DOCS.md)**: Detalls d'infraestructura, volums i xarxes.
👉 **[Arquitectura Backend (BACKEND_TECH.md)](https://www.google.com/search?q=./doc/BACKEND_TECH.md)**: Detalls de professionalització, validació i optimització.
👉 **[Guia d'Ús (USAGE.md)](https://www.google.com/search?q=./doc/USAGE.md)**: Fluxos de treball, migracions i manteniment.
👉 **[Justificació MongoDB (MONGODB_JUSTIFICACIO.md)](https://www.google.com/search?q=./doc/MONGODB_JUSTIFICACIO.md)**: Justificació de requisits de l'Activitat 3 (Repte 2).