#!/bin/bash

# 1. Copiamos el .env.prod de la raíz a la carpeta frontend
# Lo renombramos a .env para que Expo/Vite lo detecten automáticamente
echo "📦 Copiando configuración de entorno..."
cp .env.prod frontend/.env

# 2. Ejecutamos Docker Compose
echo "🚀 Iniciando construcción y despliegue..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d

# 3. (Opcional) Limpieza
# Borramos el .env dentro de frontend para no dejar residuos, 
# ya que la imagen ya se construyó con las variables dentro.
echo "🧹 Limpiando archivos temporales..."
rm frontend/.env

echo "✅ ¡Despliegue finalizado!"