# 🔐 Connection & Usage Guide

Our infrastructure is hosted on a private **Proxmox** cluster. External access to internal services is managed via **Cloudflare Zero Trust**.

## 🚀 Database Access

### 1. Establish the Tunnel


```bash
cloudflared access tcp --hostname database-panel.kore29.com --listener localhost:27017

```

### 2. Connection Parameters

Once the tunnel is active, use these credentials in your DB client (Compass, TablePlus):

| Parameter | Value |
| --- | --- |
| **Host** | `127.0.0.1` |
| **Port** | `27017` |
| **Protocol** | `mongodb+srv` (or standard depending on config) |
| **Auth** | *Requested via Admin* |

## 🛠 Backend Development

When developing locally, ensure your environment variables point to the correct endpoints.

* **API Base URL:** `https://api-enginy.kore29.com`
* **CORS Whitelist:** Should include `enginy.kore29.com` for production.
