# 🚀 Enginy Monorepo

This monorepo contains the entire Enginy ecosystem, managed with Turborepo and npm.

## 🌐 Production Environment

The ecosystem is exposed via secure Cloudflare Tunnels.

* **Frontend UI:** [enginy.kore29.com](https://enginy.kore29.com)
* **API Gateway:** [api-enginy.kore29.com](https://api-enginy.kore29.com)

##  Monorepo Structure

*   `apps/web`: Next.js application (client/admin).
*   `apps/api`: Node.js backend.
*   `apps/mobile`: Expo application (not dockerized).
*   `packages/ui`: Shared UI components library.

## 🛠️ Tech Stack

### **Backend (apps/api)**

*   **Runtime:** Node.js (Express.js).
*   **Database:** MongoDB via Mongoose ODM.
*   **Infrastructure:** Docker & Docker Compose.

### **Frontend (apps/web)**

*   **Framework:** Next.js (React).
*   **Infrastructure:** Docker & Docker Compose.

### **Mobile (apps/mobile)**

*   **Framework:** Expo (React Native).

## 🐳 Docker-based Workflow

This project is fully containerized for both development and production environments.

### Development Environment

To start the development environment with hot-reloading for the `web` and `api` applications, run:

```bash
docker-compose up --build
```

This will start the following services:

*   `web`: Next.js app, accessible at `http://localhost:3000`.
*   `api`: Node.js API, accessible at `http://localhost:4000`.
*   `mongodb`: MongoDB database.

### Production Environment

To build and start the production-ready containers, run:

```bash
docker-compose -f docker-compose.prod.yml up --build
```

This will build optimized images and start the `web` and `api` services in production mode.

## 🔄 Development Workflow

We follow strict Git standards to ensure stability and clean versioning.

### **GitFlow Strategy**

* **`main`**: The production-ready branch. Every push here triggers the **self-hosted runner**.
* **`dev`**: The active integration branch for features and testing.
* **`feature/*` / `fix/***`: Temporary branches for isolated development.

### **Commit Convention**

We follow [Conventional Commits](https://www.conventionalcommits.org/):

* `feat:` New features.
* `fix:` Bug fixes.
* `docs:` Documentation changes.
* `refactor:` Code changes that neither fix a bug nor add a feature.

## 🗺️ 3. Roadmap

* [x] Finalize Frontend stack.
* [ ] Implement JWT Auth & RBAC (Role-Based Access Control).
* [x] Setup **CI/CD Pipelines** via GitHub Actions & Proxmox Runner.
* [ ] API Documentation via Swagger.

## 🔑 4. Access Control & Deployment

To connect to the internal databases or trigger deployments in the **Proxmox LXC**, please refer to our internal guides:

👉 **[Technical Documentation (DOCS.md)](https://www.google.com/search?q=./doc/DOCS.md)**
👉 **[Connection & Usage Guide (USAGE.md)](https://www.google.com/search?q=./doc/USAGE.md)**

> [!IMPORTANT]
> This project uses a **self-hosted runner** named `projects`. Ensure the runner is in **Idle** status before pushing critical updates to `main`.
