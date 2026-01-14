# Stage 1: Base
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 2: Pruner (Optimizamos para que haga ambos a la vez)
FROM base AS pruner
COPY . .
RUN npm install -g turbo
RUN turbo prune web --docker
RUN turbo prune api --docker

# Stage 3: Builder Web
FROM base AS builder-web
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm install
COPY --from=pruner /app/out/full/ .
RUN npx turbo run build --filter=web

# Stage 4: Runner Web (PRODUCCIÓN)
FROM base AS runner-web
ENV NODE_ENV=production
COPY --from=builder-web /app/apps/web/.next/standalone ./
COPY --from=builder-web /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder-web /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]

# Stage 5: Builder API
FROM base AS builder-api
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm install
COPY --from=pruner /app/out/full/ .
RUN npx turbo run build --filter=api

# Stage 6: Runner API (PRODUCCIÓN)
FROM base AS runner-api
ENV NODE_ENV=production
COPY --from=builder-api /app/apps/api/dist ./dist
COPY --from=builder-api /app/node_modules ./node_modules
COPY --from=builder-api /app/apps/api/package.json ./package.json

EXPOSE 4000
CMD ["node", "dist/index.js"]