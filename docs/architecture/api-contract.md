# TRAZA — Contrato inicial de la API

## 1. Objetivo

Definir los endpoints previstos para el MVP de TRAZA y establecer sus
responsabilidades, datos generales, reglas de acceso y respuestas esperadas.

Este documento es una especificación inicial. Los endpoints de negocio
descritos aquí son propuestas y todavía no están implementados.

## 2. Convenciones generales

- Base local prevista: `http://127.0.0.1:8000`.
- Documentación interactiva: `/docs`.
- Formato de intercambio: JSON, salvo operaciones de archivos.
- Los identificadores de recursos serán UUID cuando se defina el modelo físico.
- Las fechas y horas deberán usar formatos consistentes y documentados.
- Los errores no expondrán tokens, secretos ni datos privados innecesarios.
- Los endpoints protegidos requerirán autenticación y autorización en el servidor.

## 3. Endpoints implementados actualmente

| Método | Ruta | Acceso | Estado |
|---|---|---|---|
| GET | `/` | Público | Implementado |
| GET | `/health` | Público | Implementado |

### GET /

Respuesta actual:

```json
{
  "message": "Bienvenido a TRAZA API",
  "docs": "/docs"
}
```

### GET /health

Respuesta actual:

```json
{
  "status": "ok",
  "service": "traza-api",
  "version": "0.1.0"
}
```

## 4. Endpoints de negocio propuestos

### 4.1 Perfil profesional

| Método | Ruta propuesta | Propósito |
|---|---|---|
| GET | `/api/v1/profile` | Consultar el perfil propio |
| PUT | `/api/v1/profile` | Crear o actualizar el perfil propio |

El servidor determinará el propietario a partir de la identidad autenticada.
No confiará en un identificador de usuario enviado por el cliente para
autorizar el acceso.

### 4.2 Experiencias

| Método | Ruta propuesta | Propósito |
|---|---|---|
| GET | `/api/v1/experiences` | Listar experiencias propias |
| POST | `/api/v1/experiences` | Registrar una experiencia |
| GET | `/api/v1/experiences/{experience_id}` | Consultar una experiencia propia |
| PATCH | `/api/v1/experiences/{experience_id}` | Actualizar campos permitidos |
| DELETE | `/api/v1/experiences/{experience_id}` | Solicitar eliminación de una experiencia |

Las experiencias podrán representar empleos, prácticas y proyectos.
Las validaciones de fechas, campos obligatorios y propiedad se definirán
antes de implementar estos endpoints.

### 4.3 Competencias

| Método | Ruta propuesta | Propósito |
|---|---|---|
| GET | `/api/v1/competencies` | Consultar competencias disponibles y propias |
| POST | `/api/v1/competencies` | Registrar una competencia propia |
| POST | `/api/v1/experiences/{experience_id}/competencies` | Asociar una competencia a una experiencia |
| DELETE | `/api/v1/experiences/{experience_id}/competencies/{competency_id}` | Retirar una asociación |

Una competencia declarada por el usuario no se considerará automáticamente
validada por un tercero ni certificada oficialmente.

### 4.4 Evidencias

| Método | Ruta propuesta | Propósito |
|---|---|---|
| GET | `/api/v1/experiences/{experience_id}/evidences` | Listar evidencias autorizadas |
| POST | `/api/v1/experiences/{experience_id}/evidences` | Registrar o cargar una evidencia |
| DELETE | `/api/v1/evidences/{evidence_id}` | Eliminar una evidencia propia |

Antes de implementar las operaciones de archivos se definirán formatos,
límites de tamaño, almacenamiento, autorización y eliminación.
Las evidencias serán privadas por defecto.

### 4.5 Portafolio público

| Método | Ruta propuesta | Propósito |
|---|---|---|
| GET | `/api/v1/portfolio` | Consultar la configuración propia |
| PATCH | `/api/v1/portfolio` | Configurar publicación y visibilidad |
| GET | `/api/v1/public/portfolios/{slug}` | Consultar únicamente información publicada |

La respuesta pública incluirá exclusivamente campos autorizados para
publicación. Desactivar la publicación deberá impedir nuevas consultas
públicas del portafolio.

### 4.6 Exportación del CV

| Método | Ruta propuesta | Propósito |
|---|---|---|
| GET | `/api/v1/cv` | Obtener los datos propios disponibles para el CV |
| POST | `/api/v1/cv/export` | Generar un CV en PDF |

La exportación respetará los permisos y la información disponible.
No inventará títulos, experiencias, certificaciones ni resultados.

## 5. Autenticación y autorización

Los endpoints de negocio que gestionan información privada requerirán
autenticación cuando se implementen.

La integración propuesta con Supabase Auth todavía debe definirse y probarse.
La API deberá validar la identidad y comprobar la propiedad de cada recurso.
Ocultar una opción en el frontend no sustituye la autorización del servidor.

## 6. Errores previstos

Se utilizarán códigos HTTP según el resultado de cada operación:

- `200 OK`: consulta o actualización completada.
- `201 Created`: recurso creado.
- `204 No Content`: operación completada sin cuerpo de respuesta.
- `400 Bad Request`: solicitud inválida.
- `401 Unauthorized`: falta autenticación válida.
- `403 Forbidden`: operación no autorizada.
- `404 Not Found`: recurso inexistente o no accesible según la política definida.
- `409 Conflict`: conflicto con el estado del recurso.
- `422 Unprocessable Entity`: datos que no superan la validación.
- `500 Internal Server Error`: error inesperado del servidor.

La estructura definitiva del cuerpo de error se establecerá antes de implementar
los endpoints de negocio.

## 7. Versionado y compatibilidad

Los endpoints de negocio se proponen bajo el prefijo `/api/v1`.
Las rutas actuales `/` y `/health` se mantienen sin cambios.

Los cambios incompatibles en el contrato deberán revisarse y documentarse
antes de introducirse.

## 8. Pruebas requeridas antes de publicar

- Validar entradas y respuestas.
- Comprobar autenticación y autorización.
- Intentar acceder a recursos de otro usuario con datos sintéticos.
- Verificar la privacidad de evidencias y portafolios.
- Comprobar que la publicación pueda revocarse.
- Probar errores y casos límite.
- Confirmar que no se filtren datos privados.

## 9. Estado

La raíz y la ruta de salud están implementadas.
Los endpoints de negocio de este documento son propuestas, no funcionalidades
disponibles. No se han creado tablas ni conectado servicios externos mediante
este documento.
