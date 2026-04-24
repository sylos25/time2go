# Base de Datos Time2Go

Este documento resume la estructura de la base de datos definida en `scripts SQL/DDL Time2Go.SQL` y los objetos SQL complementarios (`funciones`, `triggers`, `insert_fun_triggers.sql`).

## 1) Motor, esquema, tipos y extensiones

- **Motor objetivo:** PostgreSQL.
- **Esquema de funciones de negocio:** `app_api`.
- **Tipos ENUM definidos:**
  - `tip_doc`: tipos de documento de identidad.
  - `rec_cont`: estados de recuperación de contraseña.
- **Extensión habilitada:**
  - `pgcrypto` (`CREATE EXTENSION IF NOT EXISTS pgcrypto;`)
  - Se usa principalmente para hashing/derivaciones (`digest(...)`) en generación de IDs públicos mediante triggers.

## 2) Clasificación funcional de tablas

## 2.1 Tablas maestras / independientes (catálogos)

Son tablas de referencia relativamente estables.

- `tabla_paises`
- `tabla_departamentos`
- `tabla_municipios`
- `tabla_tipo_sitios`
- `tabla_tipo_infraestructura_discapacitados`
- `tabla_roles`
- `tabla_accesibilidad_menu`
- `tabla_categoria_ban`
- `tabla_motivos_ban`
- `tabla_categoria_eventos`
- `tabla_tipo_eventos`
- `tabla_categoria_denuncia_evento`
- `tabla_motivos_denuncia_eventos`
- `tabla_planes_organizador`

## 2.2 Tablas operativas principales (núcleo de negocio)

Representan entidades activas del dominio.

- `tabla_usuarios`
- `tabla_usuarios_credenciales`
- `tabla_sitios`
- `tabla_sitios_telefonos`
- `tabla_sitios_discapacitados`
- `tabla_eventos`
- `tabla_eventos_telefonos`
- `tabla_evento_informacion_importante`
- `tabla_imagenes_eventos`
- `tabla_boleteria`
- `tabla_links`

## 2.3 Tablas transaccionales

Registran acciones/eventos de negocio con alta rotación.

- `tabla_reserva_eventos`
- `tabla_reserva_asistentes`
- `tabla_favoritos`
- `tabla_valoraciones`
- `tabla_denuncia_eventos`
- `tabla_cambio_rol_usuario` (flujo de pago/cambio de rol)
- `tabla_suscripciones_organizador` (ciclo de suscripción)
- `tabla_baneados` (histórico de baneos aplicados)

## 2.4 Tablas de soporte de autenticación/sesión

- `tabla_validacion_email_tokens`
- `tabla_recuperacion_contrasena_tokens`

## 2.5 Tablas de auditoría

Modelo de auditoría en tres niveles:

- `tabla_auditoria_bd` (cabecera: tabla afectada, operación, usuario, timestamp)
- `tabla_auditoria_pk` (PK del registro impactado)
- `tabla_auditoria_detalle` (columna, valor anterior, valor nuevo)

## 2.6 Tablas de configuración de inicio/home

- `tabla_inicio_hero_imagenes`
- `tabla_inicio_categorias`

## 3) Relaciones clave (vista rápida)

- **Geografía:** `pais -> departamento -> municipio`.
- **Usuarios:** `tabla_usuarios` referencia `tabla_roles` y opcionalmente `tabla_paises`.
- **Eventos:** `tabla_eventos` referencia usuario creador, categoría, tipo y sitio.
- **Sitios y accesibilidad:** `tabla_sitios` + `tabla_sitios_discapacitados` + catálogo de infraestructura.
- **Reservas:** `tabla_reserva_eventos` (usuario-evento) y `tabla_reserva_asistentes` (detalle de acompañantes).
- **Moderación:** catálogo de denuncia + `tabla_denuncia_eventos`; catálogo de ban + `tabla_baneados`.
- **Permisos:** `tabla_accesibilidad_menu` + `tabla_accesibilidad_menu_x_rol`.
- **Suscripciones/pagos organizador:** `tabla_planes_organizador`, `tabla_suscripciones_organizador`, `tabla_cambio_rol_usuario`.

## 4) Restricciones e integridad importantes

- **PK/FK** en todas las entidades principales.
- **Unicidad** en campos críticos (por ejemplo correo, `id_publico`, `id_publico_evento`, combinaciones de negocio).
- **Checks** de negocio:
  - longitud mínima de campos de texto,
  - rangos numéricos (`cupo`, teléfono, precios),
  - estados permitidos (suscripciones, denuncias, pagos),
  - ventanas de fechas válidas (suscripciones).
- **Índice parcial relevante:**
  - `uq_suscripcion_organizador_activa` para garantizar una suscripción activa por usuario.

## 5) Funciones SQL (PL/pgSQL / SQL)

## 5.1 Funciones de autenticación y catálogo de errores

- `app_api.fn_auth_crear_usuario`
  - Alta de usuario + credenciales.
  - Retorna `JSONB` con `ok/error_code/sqlstate`.
- `app_api.fn_error_catalogo`
  - Catálogo formal de códigos de error para sincronizar DB/API/Front.

## 5.2 Funciones de eventos

- `app_api.fn_evento_crear`
  - Crea evento completo (core, teléfonos, info importante, boletería, links, imágenes, documento).
  - Incluye validaciones por plan/suscripción.
- `app_api.fn_evento_actualizar`
  - Actualiza evento y relaciones asociadas en forma set-based.
- `app_api.fn_eventos_listar_json`
  - Consulta enriquecida de eventos con joins y agregaciones JSON.

## 5.3 Funciones de usuarios/valoraciones

- `public.fn_listar_usuarios_paginado_json`
  - Listado de usuarios con filtros y paginación en JSON.
- `app_api.fn_valoraciones_obtener`
- `app_api.fn_valoraciones_obtener_por_id`
- `app_api.fn_valoraciones_crear`
- `app_api.fn_valoraciones_actualizar`
- `app_api.fn_valoraciones_eliminar`

## 6) Triggers y funciones trigger

## 6.1 Timestamps automáticos

- `fun_actualiza_fecha` + múltiples triggers `BEFORE UPDATE`
  - Actualiza `fecha_actualizacion` solo cuando hay cambios reales de datos.

## 6.2 IDs públicos derivados

- `generar_id_publico` (trigger en `tabla_usuarios`)
- `generar_id_publico_evento` (trigger en `tabla_eventos`)
- Ambos usan `digest(..., 'sha256')` para construir identificadores públicos compactos.

## 6.3 Auditoría automática

- `fun_registrar_auditoria`
  - Inserta cabecera, PKs y detalle de cambios por operación `INSERT/UPDATE/DELETE`.
  - Consume contexto de usuario mediante `current_setting('app.id_usuario', true)`.

## 7) Tipos de tablas: guía práctica

- **Maestras/independientes:** catálogos y parámetros del sistema.
- **Operativas:** entidades vivas del dominio (`usuarios`, `eventos`, `sitios`).
- **Transaccionales:** hechos de negocio (`reservas`, `pagos`, `denuncias`, `valoraciones`).
- **Auditoras:** trazabilidad de cambios a nivel tabla/registro/columna.
- **Soporte de seguridad:** tokens de validación/recuperación.

## 8) Recomendaciones de operación

- Mantener scripts de `DDL`, `funciones` y `triggers` versionados y aplicados en orden.
- Tratar `pgcrypto` como dependencia obligatoria del esquema.
- Validar periódicamente:
  - consistencia entre funciones `app_api` y API de aplicación,
  - vigencia de catálogos de permisos/roles,
  - crecimiento de tablas transaccionales y de auditoría (estrategia de retención/particionado si aplica).

## 9) Inventario rápido de objetos (resumen)

- **Tablas:** ~40+ (según DDL actual).
- **Funciones SQL/PLpgSQL:** auth, eventos, usuarios, valoraciones, catálogo de errores.
- **Triggers:** timestamps automáticos, IDs públicos, auditoría.
- **Extensión:** `pgcrypto`.

