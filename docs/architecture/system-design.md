# TRAZA — Arquitectura del sistema

## 1. Objetivo

Definir la arquitectura técnica del MVP de TRAZA, una plataforma para
documentar trayectorias profesionales mediante experiencias, competencias
y evidencias, con controles explícitos de privacidad.

Este documento describe la arquitectura prevista. No implica que los
servicios externos, la base de datos o la infraestructura ya estén
configurados.

## 2. Estilo arquitectónico

Se propone un monolito modular con frontend y backend separados.

- El frontend presenta la interfaz y gestiona la interacción del usuario.
- El backend concentra la lógica de negocio, las validaciones y la autorización.
- PostgreSQL almacena los datos estructurados.
- Supabase Auth proporciona identidad y autenticación.
- Supabase Storage se utilizará para archivos y evidencias cuando se
  apruebe su configuración.
- Los servicios se incorporarán progresivamente, con pruebas por etapa.

La separación modular debe evitar dependencias innecesarias y facilitar
el mantenimiento sin introducir microservicios prematuramente.

## 3. Componentes

### 3.1 Frontend web

Tecnologías previstas: React, Vite, TypeScript y Tailwind CSS.

Responsabilidades:
- Presentar perfiles, experiencias, competencias y evidencias.
- Permitir editar y revisar la información profesional.
- Mostrar los controles de privacidad y publicación.
- Consumir la API mediante solicitudes HTTP.
- Mostrar errores de validación y estados de carga.
- Permitir revisar las sugerencias de IA antes de guardarlas.

El frontend no constituye una frontera de seguridad. Las restricciones
de acceso deben comprobarse también en el servidor.

### 3.2 API y lógica de negocio

Tecnologías previstas: Python, FastAPI y Pydantic.

Responsabilidades:
- Exponer endpoints documentados.
- Validar datos de entrada y salida.
- Verificar la identidad del usuario en operaciones protegidas.
- Comprobar la propiedad y autorización de cada recurso.
- Aplicar las reglas de negocio y privacidad.
- Coordinar la persistencia y el almacenamiento de archivos.
- Devolver errores coherentes sin revelar información sensible.

La API será la frontera principal de la lógica de negocio.

### 3.3 Base de datos

Tecnologías previstas: PostgreSQL, SQLAlchemy 2 y Alembic.

Responsabilidades:
- Persistir perfiles, experiencias, competencias, relaciones,
  evidencias y portafolios.
- Aplicar claves foráneas, restricciones e índices.
- Garantizar la integridad de las relaciones.
- Gestionar cambios de esquema mediante migraciones versionadas.

La elección definitiva entre PostgreSQL administrado por Supabase
y una instancia propia queda pendiente de aprobación.

### 3.4 Autenticación

Se propone Supabase Auth como proveedor de identidad.

La API deberá validar los tokens recibidos y obtener de ellos una identidad
confiable. No deberá aceptar un identificador enviado por el cliente como
prueba suficiente de identidad o propiedad.

La configuración concreta, el manejo de sesiones y la estrategia de
autorización deberán definirse antes de implementar endpoints protegidos.

### 3.5 Almacenamiento de evidencias

Se propone Supabase Storage para documentos y otros archivos.

Principios:
- Los archivos privados no serán accesibles públicamente por defecto.
- La API comprobará la autorización antes de conceder acceso.
- Los enlaces firmados tendrán duración limitada cuando corresponda.
- Se establecerán límites de tamaño y formatos permitidos.
- Las claves de almacenamiento no se tratarán como mecanismos de autorización.
- La publicación de un portafolio no hará públicas todas sus evidencias.

### 3.6 Exportación de CV

Se propone ReportLab para generar documentos PDF desde información
autorizada del perfil.

La exportación deberá respetar las preferencias de visibilidad y no añadir
experiencias, competencias, certificaciones o resultados inexistentes.

### 3.7 Asistencia de inteligencia artificial

La integración de IA se realizará en una etapa posterior.

Podrá proponer mejoras de redacción y competencias relacionadas con
información aportada por el usuario. Las sugerencias deberán distinguirse
del contenido original y requerir aprobación antes de guardarse.

No se inventarán credenciales, empleadores, fechas, resultados ni
validaciones. Antes de usar proveedores externos se definirá qué datos
pueden enviarse y bajo qué condiciones.

## 4. Flujo general de una solicitud protegida

1. El usuario interactúa con el frontend.
2. El frontend envía una solicitud HTTP a la API.
3. La API valida la identidad cuando el endpoint lo requiere.
4. La API valida los datos de entrada.
5. La lógica de negocio comprueba propiedad, permisos y reglas aplicables.
6. Se consulta o modifica la persistencia si la operación está autorizada.
7. La API devuelve únicamente los datos permitidos.
8. El frontend presenta el resultado.

Los endpoints públicos del portafolio tendrán un contrato separado y
solo devolverán los campos expresamente autorizados para publicación.

## 5. Seguridad y privacidad

- Denegar el acceso por defecto a los recursos privados.
- Aplicar autorización en el servidor para cada operación protegida.
- Verificar la propiedad de perfiles, experiencias y evidencias.
- No confiar exclusivamente en controles visuales del frontend.
- Mantener secretos fuera del repositorio Git.
- Validar archivos y URLs externas.
- Evitar registrar contraseñas, tokens y contenido privado innecesario.
- Permitir revocar la publicación del portafolio.
- Definir reglas de conservación y eliminación de datos.
- Revisar los requisitos aplicables de protección de datos personales.

Las políticas definitivas deberán probarse antes de exponer información real.

## 6. Pruebas y calidad

Se proponen:
- Pytest para pruebas unitarias y de integración de la API.
- Playwright para pruebas de flujos de usuario en el frontend.
- Pruebas de autorización entre usuarios diferentes.
- Pruebas de privacidad de portafolios y evidencias.
- Verificación automatizada en GitHub Actions.
- Migraciones revisadas y reproducibles.

Las pruebas de seguridad deberán utilizar datos sintéticos y no afectar
otros proyectos ni bases de datos existentes.

## 7. Infraestructura y entornos

Se prevé Docker Compose para coordinar los servicios locales cuando
se haya definido su configuración.

Los entornos de desarrollo, pruebas y producción deberán mantener
separados sus datos, credenciales y configuraciones.

No se iniciarán, eliminarán ni modificarán contenedores preexistentes
sin una decisión explícita y una revisión de sus dependencias.

## 8. Decisiones pendientes

Antes de implementar persistencia y autenticación deben confirmarse:
1. PostgreSQL administrado por Supabase o instancia propia.
2. Configuración y validación de tokens de Supabase Auth.
3. Responsabilidades de autorización entre FastAPI y las políticas de RLS.
4. Estructura modular concreta del backend y del frontend.
5. Matriz de visibilidad y publicación.
6. Límites, formatos y ciclo de vida de archivos.
7. Gestión de secretos y configuración por entorno.
8. Estrategia de migraciones, pruebas e integración continua.
9. Política de tratamiento de datos para futuras funciones de IA.

## 9. Estado

Documento de diseño inicial. No representa una implementación desplegada.
Las decisiones pendientes se resolverán antes de conectar servicios externos,
crear tablas o publicar información profesional.
