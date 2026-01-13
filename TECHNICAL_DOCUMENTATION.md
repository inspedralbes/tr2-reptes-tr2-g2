
# 🚀 Official Technical Manual

**Modern Stack Architecture | Cloudflare-Hetzner Hybrid | Secure API**


## 🏗️ 1. System Architecture

Project Enginy is built on a **decoupled Full-Stack architecture**, engineered for maximum scalability, maintainability, and security.

### 🧩 Service Breakdown

| Service | URL | Technology Stack | Primary Role |
| --- | --- | --- | --- |
| **Frontend** | `enginy.kore29.com` | React Native (Web) | Responsive & interactive User Interface. |
| **Backend** | `api-enginy.kore29.com` | Node.js / Express | Core business logic and request processing. |
| **Database** | `database-panel...` | MongoDB / Mongoose | Isolated data persistence layer. |

### 🔒 Network Security: Cloudflare Tunnels

The infrastructure operates without public IP addresses. All services are exposed via **encrypted tunnels**, effectively eliminating the external attack surface and providing native DDoS protection.

## 📡 2. API Specifications

Communication follows **RESTful** principles under the `/api` prefix.

### 👥 Student Module (`/api/alumnes`)

Comprehensive management of the student census.

* **GET `/**`: Retrieves the full list of students, including status and educational center.

### 🛠️ Workshop Module (`/api/talleres`)

Full control over the educational workshops offered.

* **GET `/**`: Returns the workshop catalog (descriptions, duration, and capacity).
* **POST `/**`: Creates new workshop entries.
* **PUT / DELETE `/:id**`: Individual record management and updates.

## 🛡️ 3. Security Protocols

Data integrity and privacy are at the core of the project.

### 🔑 JWT Authentication (JSON Web Tokens)

We implement a robust 5-step security flow:

1. **Identification**: User submits credentials via the login endpoint.
2. **Issuance**: The server generates and signs a unique, encrypted token.
3. **Persistence**: The frontend securely stores the token (LocalStorage/Cookies).
4. **Authorization**: Every API request must include the token in the `Authorization` header.
5. **Validation**: The server verifies the signature and expiration before granting access.

## 🚀 4. Deployment Guide (Docker)

Ensuring fast, consistent deployments across any production environment.

### ⏱️ 3-Minute Deployment:

1. **Environment Setup**: Clone the repository and configure your `.env.prod` file.
2. **Build**: Generate optimized Docker images for all services.
3. **Launch**: Spin up services in detached mode.

> [!TIP]
> **Master Deployment Command:**
> Simply run: `./deploy.sh` (which triggers the production Docker Compose stack).

## 💎 5. Code Standards

Strict linting and formatting ensure long-term code sustainability.

* **ESLint**: Enforces strict rules to prevent unused variables and improper import structures.
* **Prettier**: Automatic formatting following specific project styles (single quotes, trailing commas, and 2-space indentation).