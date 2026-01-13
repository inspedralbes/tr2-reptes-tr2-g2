# 🚀 Project Core | Enginy

**Central Hub for the Enginy Ecosystem | Unified Modern Stack**

## 🌐 Production Environment

The ecosystem is exposed via secure Cloudflare Tunnels.

* **Frontend UI:** [enginy.kore29.com](https://enginy.kore29.com)
* **API Gateway:** [api-enginy.kore29.com](https://api-enginy.kore29.com)

## 🛠️ 1. Tech Stack

Project Core integrates a robust backend with a modern, containerized frontend.

### **Backend**

* **Runtime:** Node.js (Express.js).
* **Database:** MongoDB via Mongoose ODM.
* **Infrastructure:** Docker & Docker Compose for consistent environments.

### **Frontend**

* **Status:** <kbd>TBD</kbd> (Evaluation in progress).
* **Proposed:** React Native for Web (React ecosystem).

## 🔄 2. Development Workflow

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

👉 **[Technical Documentation (DOCS.md)](https://www.google.com/search?q=./DOCS.md)**
👉 **[Connection & Usage Guide (USAGE.md)](https://www.google.com/search?q=./USAGE.md)**

> [!IMPORTANT]
> This project uses a **self-hosted runner** named `projects`. Ensure the runner is in **Idle** status before pushing critical updates to `main`.