-- Función para crear un nuevo usuario con validaciones y manejo de errores

CREATE OR REPLACE FUNCTION app_api.fn_auth_crear_usuario(
  p_email           public.tabla_usuarios_credenciales.correo_usuario%TYPE,
  p_contrasena_hash public.tabla_usuarios_credenciales.contrasena_hash%TYPE,
  p_nombres         public.tabla_usuarios.nombres%TYPE         DEFAULT NULL,
  p_apellidos       public.tabla_usuarios.apellidos%TYPE       DEFAULT NULL,
  p_id_pais         public.tabla_usuarios.id_pais%TYPE         DEFAULT NULL,
  p_id_rol          public.tabla_usuarios.id_rol%TYPE          DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_id_usuario public.tabla_usuarios.id_usuario%TYPE;
  v_id_publico public.tabla_usuarios.id_publico%TYPE;
BEGIN
  -- Validar email no vacío
  IF TRIM(p_email) IS NULL THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'AUTH_EMAIL_REQUIRED',
      'sqlstate',   '22023',
      'error',      'El correo es obligatorio'
    );
  END IF;

  -- Validar contraseña no vacía
  IF TRIM(p_contrasena_hash) IS NULL THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'AUTH_PASSWORD_REQUIRED',
      'sqlstate',   '22023',
      'error',      'La contraseña es obligatoria'
    );
  END IF;

  -- Insertar datos personales del usuario
  INSERT INTO public.tabla_usuarios (
    nombres,
    apellidos,
    id_pais,
    id_rol,
    terminos_condiciones,
    estado_usuario,
    fecha_actualizacion
  ) VALUES (
    NULLIF(TRIM(p_nombres), ''),   -- Convierte cadena vacía a NULL
    NULLIF(TRIM(p_apellidos), ''),
    p_id_pais,
    COALESCE(p_id_rol, 1),         -- Asegura valor por defecto si viene NULL
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP
  )
  RETURNING id_usuario, id_publico
  INTO v_id_usuario, v_id_publico;

  -- Insertar credenciales
  INSERT INTO public.tabla_usuarios_credenciales (
    id_usuario,
    correo_usuario,
    contrasena_hash
  ) VALUES (
    v_id_usuario,
    p_email,
    p_contrasena_hash
  );

  -- Retorno exitoso
  RETURN jsonb_build_object(
    'ok',          TRUE,
    'id_usuario',  v_id_usuario,
    'id_publico',  v_id_publico
  );

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'AUTH_EMAIL_ALREADY_EXISTS',
      'sqlstate',   SQLSTATE,
      'error',      'El correo ya está registrado'
    );
  WHEN OTHERS THEN
    -- En producción, considera registrar el error en una tabla de logs
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'DB_ERROR',
      'sqlstate',   SQLSTATE,
      'error',      SQLERRM
    );
END;
$$;
