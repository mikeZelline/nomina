# Docker - Guía de Uso

Este proyecto incluye configuración Docker para facilitar el despliegue y desarrollo.

## Archivos Docker

- **Dockerfile**: Build multi-stage que construye la aplicación Angular y la sirve con nginx
- **docker-compose.yml**: Configuración para facilitar la gestión del contenedor
- **.dockerignore**: Excluye archivos innecesarios del contexto de build
- **nginx.conf**: Configuración de nginx optimizada para aplicaciones Angular SPA

## Construcción y Ejecución

### Opción 1: Usando Docker Compose (Recomendado)

```bash
# Construir y ejecutar
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

La aplicación estará disponible en: `http://localhost:8080`

### Opción 2: Usando Docker directamente

```bash
# Construir la imagen
docker build -t nomina-app .

# Ejecutar el contenedor
docker run -d -p 8080:80 --name nomina-container nomina-app

# Ver logs
docker logs -f nomina-container

# Detener y eliminar
docker stop nomina-container
docker rm nomina-container
```

## Variables de Entorno

Las variables de entorno de Angular deben configurarse en tiempo de build. Para cambiar la configuración:

1. Modifica `src/environments/environment.ts` o `src/environments/environment.prod.ts`
2. Reconstruye la imagen: `docker-compose build`

## Características

- **Multi-stage build**: Optimiza el tamaño de la imagen final
- **Nginx Alpine**: Imagen ligera para servir la aplicación
- **SPA Routing**: Configuración nginx para soportar routing de Angular
- **Gzip compression**: Habilitado para mejor rendimiento
- **Cache headers**: Configurados para assets estáticos
- **Health check**: Endpoint `/health` para monitoreo

## Puertos

- **8080**: Puerto del host (puedes cambiarlo en docker-compose.yml)
- **80**: Puerto interno del contenedor nginx

## Troubleshooting

### El contenedor no inicia
```bash
docker-compose logs
```

### Reconstruir sin cache
```bash
docker-compose build --no-cache
```

### Verificar que la imagen se construyó correctamente
```bash
docker images | grep nomina
```
