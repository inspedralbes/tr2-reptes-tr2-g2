# Stage 1: Base (Node 22 + Librerías sistema)
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN npm install -g turbo@2.7.4
WORKDIR /app

# Stage 2: Pruner (Separa dependencias de Web y API)
FROM base AS pruner
COPY . .
RUN npm install -g turbo
RUN turbo prune web --docker
RUN turbo prune api --docker

# --- BUILDER WEB ---
FROM base AS builder-web
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm install
COPY --from=pruner /app/out/full/ .
RUN npx turbo run build --filter=web

# --- RUNNER WEB (PRODUCCIÓN) ---
FROM base AS runner-web
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder-web /app/apps/web/.next/standalone ./
COPY --from=builder-web /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder-web /app/apps/web/public ./apps/web/public
EXPOSE 8002
CMD ["node", "apps/web/server.js"]

# --- BUILDER API ---
FROM base AS builder-api
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm install
COPY --from=pruner /app/out/full/ .
WORKDIR /app/apps/api
RUN npx prisma generate
WORKDIR /app
RUN npx turbo run build --filter=api

# --- RUNNER API (PRODUCCIÓN) ---
FROM base AS runner-api
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder-api /app/node_modules ./node_modules
COPY --from=builder-api /app/apps/api/package.json ./package.json
COPY --from=builder-api /app/apps/api/src ./src
COPY --from=builder-api /app/apps/api/prisma ./prisma
COPY --from=builder-api /app/apps/api/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder-api /app/apps/api/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000
CMD ["node", "src/index.js"]