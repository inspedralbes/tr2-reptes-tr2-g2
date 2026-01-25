#!/bin/bash

# --- CONFIGURACIÓN ---
# Intentar detectar el directorio del script de forma compatible
PROJECT_DIR=$(cd "$(dirname "$0")" && pwd)

# Colores para logs bonitos (usar printf para compatibilidad)
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { printf "${YELLOW}%b${NC}\n" "$1"; }
log_success() { printf "${GREEN}%b${NC}\n" "$1"; }
log_error() { printf "${RED}%b${NC}\n" "$1"; }

log_info "🚀 Iniciando despliegue de Iter Monorepo..."

# 1. Ir al directorio
cd "$PROJECT_DIR" || { log_error "❌ Error: No encuentro el directorio $PROJECT_DIR"; exit 1; }

# 2. Bajar últimos cambios de Git
if [ "$1" = "--no-reset" ]; then
  log_info "⏩ Saltando descarga de cambios..."
else
  log_info "📥 Sincronizando cambios..."
  # Si hay cambios locales, intentamos preservarlos
  git add .
  git stash
  git pull origin main --rebase
  git stash pop || log_info "⚠️ Nota: Se han mantenido los arreglos locales."
fi

# 3. Permisos
chmod +x deploy.sh

# 4. Asegurar archivos .env
log_info "🔑 Verificando archivos de entorno..."

if [ ! -f ".env" ]; then
  log_info "⚠️ Creando .env root..."
  echo "POSTGRES_USER=postgres" > .env
  echo "POSTGRES_PASSWORD=root" >> .env
  echo "POSTGRES_DB=iter_db" >> .env
  echo "DATABASE_URL=postgresql://postgres:root@host.docker.internal:5432/iter_db?schema=public" >> .env
fi

if [ ! -f "apps/api/.env" ]; then
  echo "PORT=3000" > apps/api/.env
fi

if [ ! -f "apps/web/.env" ]; then
  echo "NEXT_PUBLIC_API_URL=https://iter.kore29.com/api" > apps/web/.env
fi

# 5. Despliegue con imágenes de GHCR
log_info "🐳 Actualizando imágenes desde Container Registry..."
if ! docker compose -f docker-compose.ghcr.yml pull; then
  log_error "❌ Error: No autorizado para descargar imágines de GHCR."
  log_info "👉 Por favor, ejecuta: echo TU_TOKEN | docker login ghcr.io -u TU_USUARIO --password-stdin"
  exit 1
fi

log_info "🚀 Levantando servicios..."
docker compose -f docker-compose.ghcr.yml up -d --remove-orphans

# 6. Verificación de salud
if [ $? -eq 0 ]; then
  log_success "✅ ¡Despliegue completado con éxito!"
  log_success "👉 URL: https://iter.kore29.com"
  
  # Limpieza
  docker image prune -f
else
  log_error "❌ Ocurrió un error al levantar los servicios."
  exit 1
fi