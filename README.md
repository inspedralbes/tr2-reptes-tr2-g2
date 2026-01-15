# 🚀 TR2 Reptes Iter - Enginy

Benvingut al nucli de l'ecosistema **Enginy**. Aquesta és una infraestructura moderna basada en un **Monorepo** gestionat amb **Turborepo**, dissenyada per ser escalable, ràpida i fàcil de desplegar.

> [!IMPORTANT]
> **ACTUALIZACIÓ ARQUITECTÒNICA (Gener 2026):**
> Hem implementat un nou flux d'arrencada seqüencial amb un servei de `setup` dedicat per garantir la màxima estabilitat i evitar conflictes de dependències en l'entorn Docker.

## 🌐 Entorn de Producció

L'ecosistema està totalment automatitzat i exposat de forma segura a través de **Cloudflare Tunnels**:

* **💻 Web UI (Client/Admin):** [enginy.kore29.com](https://enginy.kore29.com)
* **🔌 API Gateway:** [api-enginy.kore29.com](https://api-enginy.kore29.com)

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

| Servei | URL Local | Descripció |
| :--- | :--- | :--- |
| **Web App** | `http://localhost:8002` | Interfície d'Usuari i Admin |
| **API REST** | `http://localhost:3000/api` | Backend Principal |
| **Adminer** | `http://localhost:8080` | Gestor de Base de Dades |

### 🔑 Credencials de Prova (Seed)

El sistema pobla automàticament la base de dades amb les següents credencials:

* **Admin Global:** `admin@enginy.com` / `admin123`
* **Professor (Brossa):** `profe.brossa@example.com` / `password123`
* **Professor (Milà):** `profe.mila@example.com` / `password123`

## 🐳 Arquitectura Docker Seqüencial

Per evitar conflictes de lectura/escriptura de fitxers, hem implementat un flux seqüencial:

1. **`db`**: Aixeca PostgreSQL.
2. **`setup`**: Instal·la paquets, sincronitza la DB i executa el `seed`.
3. **`api` & `web`**: S'inicien només quan el `setup` ha finalitzat correctament.

Això garanteix que mai tindràs errors de "mòduls no trobats" o fitxers bloquejats.

## 🗺️ Roadmap i Documentació

* [x] Migració a **PostgreSQL + Prisma**.
* [x] Arrencada Seqüencial Premium.
* [x] Optimització amb **tsx** i **Turbopack**.
* [ ] Implementació de Lògica d'Assignació Automàtica.

---

### 📖 Documentació Tècnica Detallada

Per a més detalls, consulta els manuals a la carpeta `/doc`:

👉 **[Documentació Tècnica (DOCS.md)](./doc/DOCS.md)**: Detalls d'infraestructura, volums i xarxes.
👉 **[Guia d'Ús (USAGE.md)](./doc/USAGE.md)**: Fluxos de treball, migracions i manteniment.