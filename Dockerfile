# Dockerfile for Monorepo with Turborepo

# Stage 1: Base image
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Stage 2: Prune dependencies
FROM node:22-alpine AS pruner
WORKDIR /app
COPY . .
RUN npm install -g turbo
RUN turbo prune --scope=web --docker
RUN turbo prune --scope=api --docker

# Stage 3: Builder for web
FROM node:22-alpine AS builder-web
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm install
COPY . .
RUN npx turbo run build --filter=web

# Stage 4: Runner for web
FROM node:22-alpine AS runner-web
WORKDIR /app
COPY --from=builder-web /app/apps/web/next.config.js .
COPY --from=builder-web /app/apps/web/public ./public
COPY --from=builder-web /app/apps/web/.next/standalone ./
COPY --from=builder-web /app/apps/web/.next/static ./apps/web/.next/static
CMD ["node", "server.js"]

# Stage 5: Builder for api
FROM node:22-alpine AS builder-api
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm install
COPY . .
RUN npx turbo run build --filter=api

# Stage 6: Runner for api
FROM node:22-alpine AS runner-api
WORKDIR /app
COPY --from=builder-api /app/apps/api/dist ./dist
COPY --from=builder-api /app/package.json .
COPY --from=builder-api /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
