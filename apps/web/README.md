# TRAZA Web

Frontend web de TRAZA, construido con React, TypeScript y Vite.

## Estado

La aplicación contiene una interfaz de demostración para navegar por el
perfil profesional, consultar y registrar experiencias, gestionar competencias
y acceder a la sección de evidencias.

La información manipulada mediante el estado local de React no constituye
persistencia en servidor. La integración con la API y la autenticación deberán
verificarse antes de presentar esos flujos como funcionalidades completas.

## Requisitos

- Node.js compatible con la versión de Vite del proyecto.
- npm.

## Instalación

Desde este directorio:

```powershell
npm install
```

## Desarrollo

```powershell
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir la aplicación.

## Pruebas

Ejecutar las pruebas una vez:

```powershell
npm test
```

Ejecutar Vitest en modo interactivo:

```powershell
npm run test:watch
```

## Calidad y compilación

```powershell
npm run lint
npm run build
```

Para revisar la compilación:

```powershell
npm run preview
```

## Tecnologías

- React
- TypeScript
- Vite
- Vitest
- Testing Library
- ESLint
- Lucide React para iconos

## API

La API FastAPI del proyecto se encuentra en `../api`. La interfaz no debe
considerarse integrada con persistencia remota hasta verificar las solicitudes,
el manejo de errores y la configuración de los servicios.

Consulta el [README principal de TRAZA](../../README.md) para conocer la
arquitectura general y la documentación técnica.
