#!/bin/bash

# Configuración
RAMA="main"
CARPETA="~/tr2-reptes-tr2-g2/"

echo "👀 Iniciando vigilancia en la rama: $RAMA"

while true; do
    cd "$CARPETA" || exit

    # 1. Actualizamos la información de git sin descargar nada aún
    git fetch origin $RAMA

    # 2. Comparamos el hash local con el remoto
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/$RAMA)

    if [ "$LOCAL" != "$REMOTE" ]; then
        echo "🔄 Cambio detectado. Actualizando..."
        
        # 3. Descargamos el código
        git pull origin $RAMA
        
        # 4. Copiamos el .env de producción a frontend (como vimos antes)
        cp .env.prod frontend/.env

        # 5. Reconstruimos los contenedores de producción
        # Usamos --build para asegurar que se recompila el código
        docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
        
        # 6. Limpieza
        rm frontend/.env
        docker system prune -f # Opcional: Borra imágenes viejas para ahorrar espacio
        
        echo "✅ ¡Actualización completada! Esperando nuevos cambios..."
    fi

    # Esperar 60 segundos antes de volver a comprobar
    sleep 60
done
