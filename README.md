# Sistema de Nómina Electrónica

Este es un proyecto Angular 20+ que implementa una interfaz para la gestión de nómina electrónica DIAN, basado en la imagen proporcionada.

## Características

- **Login**: Sistema de autenticación básico
- **Gestión de Nómina**: Interfaz completa para manejar comprobantes de nómina electrónica
- **Parámetros DIAN**: Configuración de parámetros según normativa DIAN
- **Tabla de Comprobantes**: Visualización y gestión de comprobantes de empleados
- **Acciones**: Botones para buscar, procesar, eliminar y generar archivos

## Tecnologías

- Angular 20+
- TypeScript
- CSS (sin frameworks)
- Signals (Angular moderno)
- Standalone Components

## Estructura del Proyecto

```
src/
├── app/
│   ├── login/                    # Módulo de autenticación
│   │   ├── login.component.ts
│   │   ├── login.component.html
│   │   └── login.component.css
│   ├── nomina/                   # Módulo principal de nómina
│   │   ├── nomina.component.ts   # Componente principal
│   │   ├── header/               # Cabecera con info empresa y parámetros
│   │   ├── comprobantes-table/   # Tabla de comprobantes
│   │   ├── actions/              # Botones de acción
│   │   ├── models/               # Interfaces TypeScript
│   │   └── nomina.service.ts     # Servicio para API
│   └── app.component.ts
├── environments/                 # Configuración de entorno
└── styles.css                   # Estilos globales
```

## Configuración

### Variables de Entorno

El proyecto utiliza variables de entorno para configuración:
- `apiBaseUrl`: URL base de la API (configurado para desarrollo)
- `serverIp`: IP del servidor
- `timeout`: Timeout para peticiones HTTP
- `retries`: Número de reintentos

### Path Aliases

Configurados en `tsconfig.json`:
- `@app/*`: `app/*`
- `@shared/*`: `app/shared/*`
- `@core/*`: `app/core/*`
- `@environments/*`: `environments/*`

## Funcionalidades

### Módulo de Login
- Formulario simple de usuario/contraseña
- Redirección automática tras login exitoso

### Módulo de Nómina

#### Cabecera
- Información de empresa (ARENA COMMUNICATIONS COLOMBIA SAS)
- Parámetros DIAN configurables:
  - Año y mes
  - Sucursal Pila
  - Procedimiento
  - Consecutivo y Lote
  - Estado de envío

#### Tabla de Comprobantes
- Muestra todos los empleados y sus comprobantes
- Selección de filas para acciones
- Formato de moneda colombiano
- Estados de marcación (ENVIADO, etc.)

#### Acciones Disponibles
- **Buscar**: Filtrar por parámetros
- **Mostrar Todos**: Cargar todos los comprobantes
- **Eliminar Comprobante**: Eliminar comprobante seleccionado
- **Procesar**: Procesar nómina
- **Generación Archivos**: Crear archivos ZIP para DIAN
- **Cargue CUNE**: Cargar códigos CUNE
- **Aceptar/Cancelar**: Acciones finales

## Reglas de Desarrollo

El proyecto sigue las siguientes reglas establecidas:

1. **Angular Moderno**: Uso de Angular 20+ con features modernas
2. **CSS Puro**: Sin frameworks como Tailwind o Bootstrap
3. **Path Aliases**: Rutas absolutas para imports
4. **Variables de Entorno**: No hardcoded values
5. **Logging**: 3 logs por endpoint API (URL, Payload, Response)
6. **Componentes Reutilizables**: Evitar duplicación
7. **Estructura Separada**: Archivos .ts, .html, .css separados

## API Integration

El proyecto está preparado para integrarse con una API backend. El servicio `NominaService` incluye:

- `getComprobantes()`: Obtener comprobantes
- `eliminarComprobante()`: Eliminar comprobante
- `procesarNomina()`: Procesar nómina

Todas las llamadas API incluyen logging según las reglas establecidas.

## Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm start

# Build para producción
npm run build
```

## Ejecución con Docker

```bash
# Construir la imagen
docker build -t nomina-app .

# Ejecutar el contenedor (publicará en http://localhost:4200)
docker run --rm -p 4200:80 nomina-app

# Alternativa con docker compose
docker compose up --build
```

## Próximos Pasos

- Integración con API backend real
- Implementación de autenticación robusta
- Validaciones adicionales de formularios
- Tests unitarios
- PWA features















