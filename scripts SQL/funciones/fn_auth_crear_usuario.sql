  -- Funcion para crear un nuevo usuario con sus credenciales y datos personales.
-- ─────────────────────────────────────────────────────────────────────────────
-- fn_auth_crear_usuario
-- Crea un usuario con sus credenciales y datos personales en tres INSERTs
-- secuenciales (tabla_usuarios → tabla_personas → tabla_usuarios_credenciales).
-- Respuesta: { ok: true,  id_usuario, id_publico }
--            { ok: false, error_code, sqlstate, error }
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION app_api.fn_auth_crear_usuario(
  p_email           tabla_usuarios_credenciales.correo%TYPE,
  p_contrasena_hash tabla_usuarios_credenciales.contrasena_hash%TYPE,
  p_nombres         tabla_personas.nombres%TYPE   DEFAULT NULL,
  p_apellidos       tabla_personas.apellidos%TYPE DEFAULT NULL,
  p_id_pais         tabla_personas.id_pais%TYPE   DEFAULT NULL,
  p_id_rol          tabla_usuarios.id_rol%TYPE    DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public, app_api, pg_temp
AS $$
DECLARE
  v_id_usuario tabla_usuarios.id_usuario%TYPE;
  v_id_publico tabla_usuarios.id_publico%TYPE;
BEGIN
  -- ── 1. Validaciones de entrada ────────────────────────────────────────────
  IF NULLIF(BTRIM(COALESCE(p_email, '')), '') IS NULL THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'AUTH_EMAIL_REQUIRED',
      'sqlstate',   '22023',
      'error',      'El correo es obligatorio'
    );
  END IF;

  IF NULLIF(BTRIM(COALESCE(p_contrasena_hash, '')), '') IS NULL THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'AUTH_PASSWORD_REQUIRED',
      'sqlstate',   '22023',
      'error',      'La contrasena es obligatoria'
    );
  END IF;

  -- ── 2. Crear usuario base ─────────────────────────────────────────────────
  INSERT INTO tabla_usuarios (
    id_rol,
    terminos_condiciones,
    fecha_registro,
    estado,
    fecha_actualizacion
  ) VALUES (
    COALESCE(p_id_rol, 1),
    TRUE,
    NOW(),
    TRUE,
    NOW()
  )
  RETURNING id_usuario, id_publico
  INTO v_id_usuario, v_id_publico;

  -- ── 3. Datos personales ───────────────────────────────────────────────────
  INSERT INTO tabla_personas (
    id_usuario,
    nombres,
    apellidos,
    id_pais
  ) VALUES (
    v_id_usuario,
    NULLIF(BTRIM(p_nombres), ''),
    NULLIF(BTRIM(p_apellidos), ''),
    p_id_pais
  );

  -- ── 4. Credenciales ───────────────────────────────────────────────────────
  INSERT INTO tabla_usuarios_credenciales (
    id_usuario,
    correo,
    contrasena_hash
  ) VALUES (
    v_id_usuario,
    p_email,
    p_contrasena_hash
  );

  -- ── 5. Retorno exitoso ────────────────────────────────────────────────────
  RETURN jsonb_build_object(
    'ok',          TRUE,
    'id_usuario',  v_id_usuario,
    'id_publico',  v_id_publico
  );
EXCEPTION
  WHEN invalid_text_representation
    OR numeric_value_out_of_range THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'AUTH_INVALID_FIELD_TYPE',
      'sqlstate',   SQLSTATE,
      'error',      SQLERRM
    );
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'AUTH_EMAIL_ALREADY_EXISTS',
      'sqlstate',   SQLSTATE,
      'error',      'El correo ya esta registrado'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'DB_ERROR',
      'sqlstate',   SQLSTATE,
      'error',      SQLERRM
    );
END;
$$;