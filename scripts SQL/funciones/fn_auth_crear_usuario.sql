CREATE OR REPLACE FUNCTION app_api.fn_auth_crear_usuario(
  p_email TEXT,
  p_contrasena_hash TEXT,
  p_nombres TEXT DEFAULT NULL,
  p_apellidos TEXT DEFAULT NULL,
  p_id_pais INT DEFAULT NULL,
  p_id_rol INT DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_id_usuario INT;
  v_id_publico TEXT;
BEGIN
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

  INSERT INTO tabla_usuarios_credenciales (
    id_usuario,
    correo,
    contrasena_hash
  ) VALUES (
    v_id_usuario,
    p_email,
    p_contrasena_hash
  );

  RETURN jsonb_build_object(
    'ok', TRUE,
    'id_usuario', v_id_usuario,
    'id_publico', v_id_publico
  );
END;
$$;