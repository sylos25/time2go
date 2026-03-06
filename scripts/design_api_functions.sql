-- Design package: SQL function contracts to move app/api business logic into PostgreSQL.
-- Note: This file is a design blueprint. It is intentionally non-executable.
-- Goal: define stable function contracts (inputs/outputs) per API route.

-- =====================================================================
-- 1) AUTH / USER CORE
-- =====================================================================

-- src/app/api/auth/route.ts
-- Creates user + persona + credentials in one transaction.
-- Returns id_usuario and id_publico.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_auth_crear_usuario(
--   p_email TEXT,
--   p_contrasena_hash TEXT,
--   p_nombres TEXT,
--   p_apellidos TEXT,
--   p_id_pais INT,
--   p_id_rol INT DEFAULT 1
-- ) RETURNS JSONB;

-- src/app/api/login/route.ts
-- Validates credentials and returns user identity payload for token generation.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_auth_validar_credenciales(
--   p_email TEXT,
--   p_password_plain TEXT
-- ) RETURNS JSONB;

-- src/app/api/login-google/route.ts
-- Upsert login by Google account id.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_auth_login_google(
--   p_google_id TEXT,
--   p_email TEXT,
--   p_nombres TEXT,
--   p_apellidos TEXT,
--   p_id_pais INT DEFAULT NULL
-- ) RETURNS JSONB;

-- src/app/api/me/route.ts
-- Read current user profile summary.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_usuario_perfil(
--   p_id_usuario INT
-- ) RETURNS JSONB;

-- =====================================================================
-- 2) EVENTS CORE (HIGH PRIORITY TO MOVE TO PG)
-- =====================================================================

-- src/app/api/events/route.ts POST
-- Creates full event aggregate:
-- tabla_eventos, tabla_eventos_telefonos, info_importante, boleteria, links,
-- and metadata refs for docs/images uploaded by app layer.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_evento_crear(
--   p_id_usuario INT,
--   p_evento JSONB,
--   p_telefonos JSONB DEFAULT '[]'::JSONB,
--   p_info_importante JSONB DEFAULT '[]'::JSONB,
--   p_boleteria JSONB DEFAULT '[]'::JSONB,
--   p_links JSONB DEFAULT '[]'::JSONB,
--   p_imagenes JSONB DEFAULT '[]'::JSONB,
--   p_documento JSONB DEFAULT NULL
-- ) RETURNS JSONB;

-- src/app/api/events/[id]/route.ts PUT
-- Updates full event aggregate and syncs child tables.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_evento_actualizar(
--   p_id_evento INT,
--   p_id_usuario_editor INT,
--   p_evento JSONB,
--   p_telefonos JSONB DEFAULT '[]'::JSONB,
--   p_info_importante JSONB DEFAULT '[]'::JSONB,
--   p_boleteria JSONB DEFAULT '[]'::JSONB,
--   p_links JSONB DEFAULT '[]'::JSONB,
--   p_imagenes_nuevas JSONB DEFAULT '[]'::JSONB,
--   p_ids_imagenes_eliminar INT[] DEFAULT '{}'::INT[]
-- ) RETURNS JSONB;

-- src/app/api/events/[id]/route.ts DELETE
-- Hard delete full event aggregate.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_evento_eliminar(
--   p_id_evento INT,
--   p_id_usuario_editor INT
-- ) RETURNS JSONB;

-- src/app/api/events/route.ts GET
-- Returns denormalized event list with nested arrays and optional filters.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_eventos_listar_json(
--   p_id_evento INT DEFAULT NULL,
--   p_id_publico_evento TEXT DEFAULT NULL,
--   p_only_mine BOOLEAN DEFAULT FALSE,
--   p_include_all BOOLEAN DEFAULT FALSE,
--   p_id_usuario_solicitante INT DEFAULT NULL,
--   p_page INT DEFAULT 1,
--   p_page_size INT DEFAULT 20
-- ) RETURNS JSONB;

-- src/app/api/events/[id]/toggle-status/route.ts
-- Moderation status toggle + audit reason.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_evento_toggle_estado(
--   p_id_evento INT,
--   p_nuevo_estado BOOLEAN,
--   p_id_usuario_modera INT,
--   p_motivo_rechazo TEXT DEFAULT NULL
-- ) RETURNS JSONB;

-- src/app/api/events/[id]/valoraciones/route.ts
-- Upsert event rating.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_evento_valorar(
--   p_id_evento INT,
--   p_id_usuario INT,
--   p_valoracion INT,
--   p_comentario TEXT DEFAULT NULL
-- ) RETURNS JSONB;

-- =====================================================================
-- 3) RESERVAS
-- =====================================================================

-- src/app/api/reservas/route.ts POST
-- Creates booking + asistentes with capacity/eligibility checks.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_reserva_crear(
--   p_id_usuario INT,
--   p_id_evento INT,
--   p_tipo_documento TEXT,
--   p_numero_documento TEXT,
--   p_cuantos_asistiran INT,
--   p_asistentes JSONB DEFAULT '[]'::JSONB
-- ) RETURNS JSONB;

-- src/app/api/reservas/[id]/route.ts PATCH/DELETE
-- Cancels booking following business time-window rules.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_reserva_cancelar(
--   p_id_reserva_evento INT,
--   p_id_usuario INT
-- ) RETURNS JSONB;

-- src/app/api/reservas/route.ts GET
-- Paginated reservation list with event snapshot.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_reservas_listar_json(
--   p_id_usuario INT,
--   p_page INT DEFAULT 1,
--   p_page_size INT DEFAULT 20,
--   p_estado BOOLEAN DEFAULT NULL,
--   p_q TEXT DEFAULT NULL
-- ) RETURNS JSONB;

-- =====================================================================
-- 4) DASHBOARD ADMIN (GET/INSERT/UPDATE)
-- =====================================================================

-- src/app/api/admin/get-data/route.ts
-- Replaces dynamic queryMap in app layer.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_admin_get_data(
--   p_table_key TEXT,
--   p_limit INT DEFAULT 200
-- ) RETURNS JSONB;

-- src/app/api/admin/insert-data/route.ts
-- Controlled inserts by table key and JSON payload.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_admin_insert_data(
--   p_table_key TEXT,
--   p_payload JSONB,
--   p_id_usuario_auditoria INT DEFAULT NULL
-- ) RETURNS JSONB;

-- src/app/api/admin/update-data/route.ts
-- Controlled updates by table key and allow-list columns.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_admin_update_data(
--   p_table_key TEXT,
--   p_id BIGINT,
--   p_payload JSONB,
--   p_id_usuario_auditoria INT DEFAULT NULL
-- ) RETURNS JSONB;

-- =====================================================================
-- 5) USERS / MODERATION
-- =====================================================================

-- src/app/api/usuarios/route.ts GET
-- You already have fn_listar_usuarios_paginado_json; keep and extend if needed.

-- src/app/api/usuarios/[id]/ban/route.ts
-- Ban/unban with role checks and reason tracking.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_usuario_toggle_ban(
--   p_id_usuario_objetivo INT,
--   p_id_usuario_admin INT,
--   p_ban BOOLEAN,
--   p_motivo TEXT DEFAULT NULL,
--   p_inicio TIMESTAMP DEFAULT NULL,
--   p_fin TIMESTAMP DEFAULT NULL
-- ) RETURNS JSONB;

-- =====================================================================
-- 6) CATALOG ENDPOINTS
-- =====================================================================

-- src/app/api/categoria_evento/route.ts
-- src/app/api/tipo_evento/route.ts
-- src/app/api/categoria_boleto/route.ts
-- src/app/api/llamar_pais/route.ts
-- src/app/api/municipios/route.ts
-- src/app/api/llamar_sitio/route.ts
-- Signature proposals:
-- CREATE FUNCTION app_api.fn_catalogo_categorias_evento() RETURNS JSONB;
-- CREATE FUNCTION app_api.fn_catalogo_tipos_evento(p_id_categoria_evento INT) RETURNS JSONB;
-- CREATE FUNCTION app_api.fn_catalogo_categorias_boleto() RETURNS JSONB;
-- CREATE FUNCTION app_api.fn_catalogo_paises() RETURNS JSONB;
-- CREATE FUNCTION app_api.fn_catalogo_municipios_por_sitio(p_id_sitio INT) RETURNS JSONB;
-- CREATE FUNCTION app_api.fn_catalogo_sitios_por_municipio(p_id_municipio INT) RETURNS JSONB;

-- =====================================================================
-- 7) STATS
-- =====================================================================

-- src/app/api/stats/route.ts
-- Dashboard counters in one function call.
-- Signature proposal:
-- CREATE FUNCTION app_api.fn_stats_dashboard(
--   p_id_usuario INT
-- ) RETURNS JSONB;

-- =====================================================================
-- 8) TOKENS / VALIDATION / PASSWORD FLOWS
-- =====================================================================

-- These are DB-friendly for token persistence and validation rules, while
-- email dispatch and JWT issuance remain in app layer.

-- src/app/api/send-validation-email/route.ts
-- CREATE FUNCTION app_api.fn_email_validation_token_crear(p_id_usuario INT, p_ttl_hours INT DEFAULT 24) RETURNS JSONB;

-- src/app/api/validate-email/route.ts
-- CREATE FUNCTION app_api.fn_email_validation_token_consumir(p_token TEXT) RETURNS JSONB;

-- src/app/api/reset-password/route.ts
-- CREATE FUNCTION app_api.fn_password_reset_token_crear(p_correo TEXT, p_ttl_minutes INT DEFAULT 30) RETURNS JSONB;
-- CREATE FUNCTION app_api.fn_password_reset_token_consumir(p_token TEXT, p_contrasena_hash TEXT) RETURNS JSONB;

-- src/app/api/change-password/route.ts
-- CREATE FUNCTION app_api.fn_password_cambiar(p_id_usuario INT, p_hash_actual TEXT, p_hash_nuevo TEXT) RETURNS JSONB;

-- =====================================================================
-- 9) WHAT STAYS IN APP LAYER (NOT SQL)
-- =====================================================================

-- Keep in Node/Next:
-- - JWT creation/verification and cookies/session transport.
-- - OAuth exchanges (Google).
-- - Sending emails.
-- - File binary upload to external storage (R2/S3/local provider).
-- - HTTP concerns, status codes, and API-level rate limiting.

-- =====================================================================
-- 10) DEPLOYMENT STRATEGY
-- =====================================================================

-- Phase 1: implement fn_auth_crear_usuario, fn_evento_crear, fn_evento_actualizar, fn_evento_eliminar.
-- Phase 2: implement fn_eventos_listar_json and fn_reserva_crear/cancelar.
-- Phase 3: move admin get/insert/update contracts to DB allow-lists.
-- Phase 4: leave app layer as thin orchestrator calling SELECT app_api.fn_xxx(...).
