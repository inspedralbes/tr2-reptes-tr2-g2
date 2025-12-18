# Backend del Proyecto

Este documento proporciona una visión general de la estructura del backend, explicando el propósito de cada carpeta y archivo principal.

## Estructura de Carpetas y Archivos

El proyecto está organizado de una manera modular para separar responsabilidades y facilitar el mantenimiento y la escalabilidad.

```
/
├── .env
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
└── src/
    ├── index.js
    ├── config/
    ├── controllers/
    ├── models/
    ├── routes/
    └── scripts/
```

### Directorios

Contiene todo el código fuente de la aplicación.

-   `📄 index.js`: Es el punto de entrada principal de la aplicación. Se encarga de iniciar el servidor web, conectar a la base de datos y montar las rutas principales.
-   `📁 config/`: Almacena los archivos de configuración de la aplicación.
    -   `📄 database.js`: Configura y establece la conexión con la base de datos.
-   `📁 controllers/`: Contiene la lógica de negocio. Los controladores reciben las peticiones HTTP, procesan los datos de entrada, interactúan con los modelos y devuelven una respuesta al cliente.
    -   `📄 taller.controller.js`: Maneja las operaciones CRUD (Crear, Leer, Actualizar, Borrar) para el recurso de "taller".

-   `📁 models/`: Define los esquemas de datos. Representan la estructura de los documentos que se almacenan en la base de datos.
-   `📁 routes/`: Gestiona las rutas y los endpoints de la API. Asocia una URL y un método HTTP a un controlador específico.
-   `📁 scripts/`: Contiene scripts que se pueden ejecutar para realizar tareas específicas.
    -   `📄 seed.js`: Script para poblar la base de datos con datos iniciales (semillado), útil para entornos de desarrollo y pruebas.

