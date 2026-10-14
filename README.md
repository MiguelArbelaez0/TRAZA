# TRAZA

Plataforma para documentar trayectorias profesionales mediante experiencias,
competencias y evidencias, con un enfoque en la privacidad y la trazabilidad
de la información.

## Estado actual

TRAZA se encuentra en desarrollo. El repositorio incluye una interfaz web
React + TypeScript y una API inicial con FastAPI.

### Frontend

- Interfaz de demostración con navegación entre secciones.
- Gestión local de experiencias y competencias durante la sesión.
- Secciones para perfil profesional y evidencias.
- Pruebas automatizadas con Vitest y Testing Library.

Los datos de la interfaz no deben considerarse persistidos en una base de
datos mientras no exista una integración funcional con el backend.

### Backend

- API desarrollada con FastAPI.
- `GET /`: mensaje de bienvenida.
- `GET /health`: comprobación de estado.
- Documentación interactiva disponible en `/docs` cuando la API está en ejecución.

Los endpoints de negocio descritos en la documentación técnica siguen siendo
especificaciones hasta que su implementación se verifique.

## Arquitectura prevista

- **Frontend:** React, TypeScript y Vite.
- **Backend:** Python, FastAPI y Pydantic.
- **Persistencia prevista:** PostgreSQL, SQLAlchemy y Alembic.
- **Autenticación y archivos:** integración prevista con Supabase.
- **Calidad:** Pytest, Vitest, Testing Library y lint.
- **Infraestructura:** Docker Compose, pendiente de configuración y validación.

La arquitectura prevista no implica que todos estos servicios estén conectados.

## Estructura del repositorio

```text
TRAZA/
├── apps/
│   ├── api/       # API FastAPI
│   └── web/       # Interfaz React
├── docs/
│   └── architecture/
│       ├── system-design.md
│       ├── api-contract.md
│       └── data-model.md
├── infra/         # Infraestructura
├── scripts/       # Scripts auxiliares
└── README.md
```

## Requisitos

- Python compatible con las dependencias del backend.
- Node.js y npm compatibles con Vite.
- PostgreSQL y servicios externos únicamente cuando se complete su configuración.

## Ejecutar el frontend

```powershell
cd apps/web
npm install
npm run dev
```

## Validar el frontend

Desde `apps/web`:

```powershell
npm test
npm run lint
npm run build
```

## Ejecutar la API

Desde la raíz del repositorio:

```powershell
.\apps\api\.venv\Scripts\python.exe -m uvicorn apps.api.main:app --reload
```

Si el comando de importación no corresponde a la estructura Python configurada
en el entorno, utiliza el módulo de inicio que esté documentado para esa
configuración. No se presupone que la base de datos esté conectada.

## Documentación técnica

- [Diseño del sistema](docs/architecture/system-design.md)
- [Contrato de la API](docs/architecture/api-contract.md)
- [Modelo de datos](docs/architecture/data-model.md)

## Principios del proyecto

- Privacidad por defecto.
- Autorización aplicada en el servidor.
- Separación entre interfaz, lógica de negocio y persistencia.
- Evidencias y credenciales sin afirmaciones de verificación no demostradas.
- Asistencia de IA, en una fase futura, sin inventar información profesional.
