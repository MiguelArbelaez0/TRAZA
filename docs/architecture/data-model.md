# TRAZA — Modelo de datos inicial

## 1. Objetivo

Definir las entidades principales del MVP antes de implementar
la persistencia en PostgreSQL.

## 2. Entidades

### profiles
Perfil profesional asociado a una identidad autenticada.

Campos conceptuales:
- id
- display_name
- headline
- professional_summary
- location
- created_at
- updated_at

### experiences
Experiencias laborales, prácticas y proyectos registrados por el usuario.

Campos conceptuales:
- id
- profile_id
- experience_type
- title
- organization
- description
- start_date
- end_date
- is_current
- visibility
- created_at
- updated_at

### competencies
Catálogo de competencias técnicas y humanas.

Campos conceptuales:
- id
- name
- category
- description

### experience_competencies
Relación entre experiencias y competencias.

Campos conceptuales:
- experience_id
- competency_id
- proficiency_level
- context_description

### evidences
Referencias a documentos, enlaces u otros soportes de una experiencia.

Campos conceptuales:
- id
- profile_id
- experience_id
- title
- evidence_type
- storage_key
- external_url
- visibility
- created_at

### portfolios
Configuración del portafolio compartible.

Campos conceptuales:
- id
- profile_id
- slug
- is_published
- published_at
- created_at
- updated_at

## 3. Reglas de integridad

- Cada perfil pertenece a una única identidad autenticada.
- Cada experiencia pertenece a un perfil.
- Las competencias pueden asociarse a varias experiencias.
- Las evidencias pertenecen a un perfil y pueden asociarse a una experiencia.
- El contenido privado no debe publicarse automáticamente.
- Los enlaces públicos no deben permitir acceder a evidencias privadas.
- Las competencias declaradas por el usuario no equivalen a certificaciones oficiales.
- La IA puede proponer mejoras, pero no debe inventar experiencia ni credenciales.

## 4. Seguridad pendiente de diseño técnico

Antes de implementar tablas y políticas, se deben definir:

- Identidad y propiedad de los registros.
- Autorización en cada operación.
- Políticas de acceso a evidencias y almacenamiento.
- Reglas de publicación y revocación del portafolio.
- Validación de URLs y archivos.
- Auditoría de cambios relevantes.

## 5. Estado

Borrador conceptual del MVP. Los campos y relaciones deben validarse
antes de generar las migraciones SQL.
