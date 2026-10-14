# TRAZA — Modelo de datos del MVP

## 1. Objetivo y alcance

Este documento define el modelo conceptual del MVP antes de implementar
las tablas de PostgreSQL y sus migraciones.

TRAZA documenta trayectorias profesionales mediante experiencias,
competencias y evidencias, con controles explícitos de privacidad.

Los campos y restricciones descritos son una propuesta de diseño.
La implementación física se realizará después de validar las decisiones
de autenticación, autorización y almacenamiento.

## 2. Entidades principales

### 2.1 profiles

Perfil profesional asociado a una identidad autenticada.

Campos propuestos:
- id: identificador interno del perfil.
- auth_user_id: identificador único de la identidad autenticada.
- display_name: nombre visible.
- headline: titular profesional opcional.
- professional_summary: resumen profesional opcional.
- location: ubicación declarada opcional.
- created_at: fecha de creación.
- updated_at: fecha de última modificación.

Reglas:
- Cada perfil pertenece a una sola identidad autenticada.
- auth_user_id debe ser único y no debe confundirse con una contraseña.
- Los datos personales no se publican automáticamente.
- La identidad y la sesión deben validarse en el servidor.

### 2.2 experiences

Experiencias laborales, prácticas, voluntariados y proyectos.

Campos propuestos:
- id: identificador de la experiencia.
- profile_id: perfil propietario.
- experience_type: tipo de experiencia.
- title: cargo, función o nombre del proyecto.
- organization: empresa, institución u organización opcional.
- description: descripción de la experiencia.
- start_date: fecha de inicio.
- end_date: fecha de finalización opcional.
- is_current: indica si continúa activa.
- visibility: nivel de visibilidad.
- created_at: fecha de creación.
- updated_at: fecha de modificación.

Reglas:
- Cada experiencia pertenece a un perfil.
- end_date no puede ser anterior a start_date.
- Si is_current es verdadero, end_date debe ser nulo.
- experience_type y visibility deben restringirse a valores permitidos.
- La visibilidad debe aplicarse en las consultas del servidor.

Los valores definitivos de experience_type y visibility se establecerán
antes de crear las migraciones.

### 2.3 competencies

Catálogo reutilizable de competencias técnicas y humanas.

Campos propuestos:
- id: identificador de la competencia.
- name: nombre normalizado.
- category: categoría.
- description: descripción opcional.
- created_at: fecha de creación.

Reglas:
- El catálogo debe evitar duplicados equivalentes.
- Las competencias técnicas y humanas deben poder distinguirse.
- Una competencia del catálogo no constituye una certificación oficial.

### 2.4 experience_competencies

Relación entre experiencias y competencias.

Campos propuestos:
- experience_id: experiencia relacionada.
- competency_id: competencia asociada.
- proficiency_level: nivel declarado por el usuario, opcional.
- context_description: explicación de cómo se aplicó la competencia.
- created_at: fecha de asociación.

Reglas:
- La combinación experience_id y competency_id debe ser única.
- Una competencia puede aparecer en varias experiencias.
- El nivel declarado no equivale a una evaluación independiente.
- La descripción debe reflejar el contexto real de la experiencia.

Los niveles de dominio y sus definiciones se concretarán antes de
implementarlos como valores restringidos.

### 2.5 evidences

Metadatos de documentos, enlaces u otros soportes relacionados con
una trayectoria profesional.

Campos propuestos:
- id: identificador de la evidencia.
- profile_id: perfil propietario.
- experience_id: experiencia relacionada, opcional.
- title: título visible.
- evidence_type: tipo de evidencia.
- storage_key: referencia interna al objeto almacenado, opcional.
- external_url: enlace externo, opcional.
- visibility: nivel de visibilidad.
- created_at: fecha de creación.
- updated_at: fecha de modificación.

Reglas:
- La evidencia pertenece a un perfil y puede relacionarse con una
  experiencia del mismo perfil.
- Debe existir una referencia de almacenamiento o un enlace externo,
  según el tipo de evidencia.
- No se deben guardar archivos privados en directorios públicos.
- El acceso a archivos privados debe comprobarse en el servidor.
- Los enlaces externos deben validarse y tratarse como contenido no confiable.
- Deben definirse límites de tamaño, formatos admitidos y controles de carga.
- Una evidencia adjunta no demuestra por sí sola que una competencia
  haya sido validada por un tercero.

### 2.6 portfolios

Configuración del portafolio profesional compartible.

Campos propuestos:
- id: identificador del portafolio.
- profile_id: perfil propietario.
- slug: identificador legible para la URL pública.
- is_published: indica si el portafolio está publicado.
- published_at: fecha de publicación, opcional.
- created_at: fecha de creación.
- updated_at: fecha de modificación.

Reglas:
- Cada perfil tendrá un único portafolio en el MVP.
- slug debe ser único.
- Un portafolio no publicado no debe ser accesible públicamente.
- Publicar el portafolio no convierte automáticamente en públicos
  todos los registros y archivos del perfil.
- La revocación debe impedir el acceso público futuro al portafolio.
- Las evidencias privadas deben seguir siendo privadas aunque se
  publique el portafolio.
- La autorización no debe depender únicamente de ocultar enlaces en la UI.

### 2.7 certifications

Registro diferenciado de credenciales o certificaciones declaradas.

Campos conceptuales propuestos:
- id: identificador de la certificación.
- profile_id: perfil propietario.
- issuer_name: entidad emisora declarada.
- credential_name: nombre de la credencial.
- issued_at: fecha de emisión, opcional.
- expires_at: fecha de vencimiento, opcional.
- credential_url: enlace de verificación, opcional.
- evidence_id: evidencia relacionada, opcional.
- verification_status: estado de verificación.
- created_at: fecha de creación.
- updated_at: fecha de modificación.

Reglas:
- Una certificación declarada no debe presentarse como verificada
  hasta contar con un mecanismo de verificación adecuado.
- No se deben inventar entidades emisoras, títulos ni resultados.
- El enlace aportado por el usuario no constituye por sí solo
  una validación independiente.
- Los estados de verificación deben definirse antes de implementarlos.
- Esta entidad no reemplaza los registros oficiales de la entidad emisora.

### 2.8 competency_validations

Registro de validaciones realizadas por terceros, separado de las
competencias declaradas por el usuario.

Campos conceptuales propuestos:
- id: identificador de la validación.
- profile_id: perfil al que se refiere.
- competency_id: competencia evaluada.
- validator_name: nombre declarado del validador.
- validator_organization: organización declarada, opcional.
- validation_method: método utilizado.
- outcome: resultado documentado.
- evidence_id: evidencia relacionada, opcional.
- validated_at: fecha de validación.
- created_at: fecha de registro.

Reglas:
- Debe distinguirse entre identidad declarada y validador autenticado.
- No se debe afirmar que una organización validó una competencia
  sin comprobar la autorización y el origen de esa validación.
- El alcance y la fiabilidad de cada validación deben ser transparentes.
- Esta entidad no equivale a una certificación oficial.

La implementación de validaciones de terceros puede aplazarse si
excede el alcance inicial del MVP.

## 3. Relaciones e integridad

- Un perfil tiene una identidad autenticada única.
- Un perfil puede tener muchas experiencias.
- Una experiencia pertenece a un único perfil.
- Las experiencias y competencias se relacionan mediante
  experience_competencies.
- Un perfil puede tener muchas evidencias.
- Una evidencia puede asociarse a una experiencia del mismo perfil.
- Un perfil tiene un portafolio en el MVP.
- Un perfil puede declarar varias certificaciones.
- Las validaciones de competencias deben conservar su procedencia.
- Las claves foráneas y restricciones deben impedir referencias inválidas.
- Las reglas de borrado deben definirse explícitamente para cada relación.
- Las fechas se almacenarán con tipos adecuados y una política temporal
  coherente entre API y base de datos.

## 4. Privacidad y autorización

- El servidor debe identificar al usuario autenticado en cada operación.
- El propietario solo puede modificar sus propios registros.
- Los identificadores recibidos por la API no demuestran propiedad.
- La publicación requiere una acción explícita del propietario.
- La API pública solo debe devolver campos autorizados.
- Los archivos privados deben utilizar acceso controlado y URLs firmadas
  de duración limitada cuando corresponda.
- La revocación de publicación y de acceso a archivos debe contemplarse.
- Las credenciales y secretos nunca deben guardarse en Git.
- Las operaciones sensibles deben registrarse sin almacenar secretos
  ni contenido privado innecesario.
- Las políticas de almacenamiento y las comprobaciones de FastAPI
  deben ser coherentes.

## 5. Asistencia mediante inteligencia artificial

- La IA puede sugerir redacciones, competencias relacionadas y mejoras
  del CV a partir de información proporcionada por el usuario.
- Las sugerencias requieren revisión y aprobación antes de guardarse.
- La IA no debe inventar experiencia, certificaciones, empleadores,
  fechas, resultados ni validaciones.
- Debe diferenciarse el texto original de las sugerencias generadas.
- No se enviarán documentos privados a proveedores externos sin una
  decisión explícita de privacidad y tratamiento de datos.
- La política de conservación y eliminación de los datos procesados
  debe definirse antes de integrar un proveedor de IA.

## 6. Decisiones pendientes antes de las migraciones

1. Confirmar la estrategia de autenticación y el origen de auth_user_id.
2. Elegir entre PostgreSQL administrado por Supabase y una instancia propia.
3. Definir enums o tablas de catálogo para tipos y estados.
4. Establecer niveles de competencia y su significado.
5. Definir la matriz de visibilidad de perfiles, experiencias y evidencias.
6. Concretar límites y formatos de archivos.
7. Definir las reglas de eliminación y conservación de datos.
8. Determinar el alcance de certificaciones y validaciones en el MVP.
9. Definir índices, restricciones, unicidad y estrategia de migraciones.
10. Revisar requisitos aplicables de protección de datos personales.

## 7. Alcance recomendado del MVP

Prioridad inicial:
- profiles
- experiences
- competencies
- experience_competencies
- evidences
- portfolios

Certifications y competency_validations quedan documentadas como
extensiones del modelo. Su inclusión física se decidirá según el alcance
validado, sin simular verificaciones oficiales.

## 8. Estado

Propuesta conceptual ampliada. Todavía no es un esquema SQL definitivo.
Las decisiones pendientes deben revisarse antes de implementar modelos,
migraciones, políticas de acceso o integración con almacenamiento.
