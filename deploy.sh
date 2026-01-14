#!/bin/bash

# --- CONFIGURACIÓN ---
# Directorio donde está tu proyecto en el servidor
PROJECT_DIR="/ruta/a/tu/proyecto/tr2-reptes-tr2-g2"

# Colores para logs bonitos
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Iniciando despliegue de Enginy Monorepo...${NC}"

# 1. Ir al directorio
cd "$PROJECT_DIR" || { echo -e "${RED}❌ Error: No encuentro el directorio $PROJECT_DIR${NC}"; exit 1; }

# 2. Bajar últimos cambios de Git
echo -e "${YELLOW}📥 Descargando cambios desde GitHub (main)...${NC}"
git fetch origin main
git reset --hard origin/main

# 3. Permisos (por si acaso han cambiado scripts)
chmod +x deploy.sh

# 4. Reconstrucción inteligente (Docker Prod)
echo -e "${YELLOW}🐳 Construyendo imágenes de Producción (Multi-stage)...${NC}"
# Usamos --build para forzar que coja los cambios de código
docker-compose -f docker-compose.prod.yml up --build -d --remove-orphans

# 5. Verificación de salud
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ ¡Despliegue completado con éxito!${NC}"
  echo -e "${GREEN}👉 Web: https://enginy.kore29.com${NC}"
  echo -e "${GREEN}👉 API: https://api-enginy.kore29.com${NC}"
  
  # 6. Limpieza de basura espacial (Importante en VPS)
  echo -e "${YELLOW}🧹 Limpiando imágenes antiguas para ahorrar espacio...${NC}"
  docker image prune -f
else
  echo -e "${RED}❌ Ocurrió un error al levantar los contenedores.${NC}"
  exit 1
fi