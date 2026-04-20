-- ─────────────────────────────────────────────────────────────────────────────
-- fn_valoraciones_obtener
-- Obtiene todas las valoraciones de un usuario con datos del evento e imagen principal.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION app_api.fn_valoraciones_obtener(
  p_id_usuario public.tabla_valoraciones.id_usuario%TYPE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_resultado JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id_valoracion',       v.id_valoracion,
      'valoracion',          v.valoracion,
      'comentario',          v.comentario,
      'fecha_creacion',      v.fecha_creacion,
      'fecha_actualizacion', v.fecha_actualizacion,
      'id_publico_evento',   e.id_publico_evento,
      'nombre_evento',       e.nombre_evento,
      'fecha_inicio',        e.fecha_inicio,
      'hora_inicio',         e.hora_inicio,
      'imagen_evento',       (
        SELECT i.url_imagen_evento
        FROM public.tabla_imagenes_eventos i
        WHERE i.id_evento = e.id_evento
        ORDER BY i.id_imagen_evento ASC
        LIMIT 1
      )
    )
    ORDER BY v.fecha_creacion DESC
  )
  INTO v_resultado
  FROM public.tabla_valoraciones v
  JOIN public.tabla_eventos e ON v.id_evento = e.id_evento
  WHERE v.id_usuario = p_id_usuario;

  RETURN jsonb_build_object(
    'ok',          TRUE,
    'valoraciones', COALESCE(v_resultado, '[]'::JSONB)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'DB_ERROR',
      'sqlstate', SQLSTATE,
      'error', SQLERRM
    );
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- fn_valoraciones_obtener_por_id
-- Obtiene una valoración específica por su ID, verificando que pertenezca al usuario.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION app_api.fn_valoraciones_obtener_por_id(
  p_id_valoracion public.tabla_valoraciones.id_valoracion%TYPE,
  p_id_usuario    public.tabla_valoraciones.id_usuario%TYPE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_resultado JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id_valoracion',       v.id_valoracion,
    'valoracion',          v.valoracion,
    'comentario',          v.comentario,
    'fecha_creacion',      v.fecha_creacion,
    'fecha_actualizacion', v.fecha_actualizacion,
    'id_publico_evento',   e.id_publico_evento,
    'nombre_evento',       e.nombre_evento,
    'fecha_inicio',        e.fecha_inicio,
    'hora_inicio',         e.hora_inicio,
    'imagen_evento',       (
      SELECT i.url_imagen_evento
      FROM public.tabla_imagenes_eventos i
      WHERE i.id_evento = e.id_evento
      ORDER BY i.id_imagen_evento ASC
      LIMIT 1
    )
  )
  INTO v_resultado
  FROM public.tabla_valoraciones v
  JOIN public.tabla_eventos e ON v.id_evento = e.id_evento
  WHERE v.id_valoracion = p_id_valoracion
    AND v.id_usuario = p_id_usuario;

  IF v_resultado IS NULL THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'VALORACION_NOT_FOUND_OR_FORBIDDEN',
      'sqlstate', 'P0002',
      'error', 'Valoración no encontrada o sin permisos'
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', TRUE,
    'valoracion', v_resultado
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'DB_ERROR',
      'sqlstate', SQLSTATE,
      'error', SQLERRM
    );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- fn_valoraciones_crear
-- Crea una nueva valoración para un evento (solo una por usuario-evento).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION app_api.fn_valoraciones_crear(
  p_id_usuario public.tabla_valoraciones.id_usuario%TYPE,
  p_id_evento  public.tabla_valoraciones.id_evento%TYPE,
  p_valoracion public.tabla_valoraciones.valoracion%TYPE,
  p_comentario public.tabla_valoraciones.comentario%TYPE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_id_valoracion public.tabla_valoraciones.id_valoracion%TYPE;
BEGIN
  -- Validar rango de valoración
  IF p_valoracion < 1 OR p_valoracion > 5 THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'VALORACION_INVALID_SCORE',
      'sqlstate', '22023',
      'error', 'La valoración debe estar entre 1 y 5'
    );
  END IF;

  INSERT INTO public.tabla_valoraciones (
    id_usuario,
    id_evento,
    valoracion,
    comentario,
    fecha_creacion,
    fecha_actualizacion
  ) VALUES (
    p_id_usuario,
    p_id_evento,
    p_valoracion,
    NULLIF(TRIM(p_comentario), ''),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  RETURNING id_valoracion INTO v_id_valoracion;

  RETURN jsonb_build_object(
    'ok',            TRUE,
    'id_valoracion', v_id_valoracion
  );
EXCEPTION
  WHEN invalid_text_representation OR numeric_value_out_of_range THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'VALORACION_INVALID_FIELD_TYPE',
      'sqlstate',   SQLSTATE,
      'error',      SQLERRM
    );
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'VALORACION_ALREADY_EXISTS',
      'sqlstate', SQLSTATE,
      'error', 'Ya existe una valoración para este evento por parte del usuario'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'DB_ERROR',
      'sqlstate', SQLSTATE,
      'error', SQLERRM
    );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- fn_valoraciones_actualizar
-- Actualiza la puntuación y/o comentario de una valoración existente (solo el dueño).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION app_api.fn_valoraciones_actualizar(
  p_id_valoracion public.tabla_valoraciones.id_valoracion%TYPE,
  p_id_usuario    public.tabla_valoraciones.id_usuario%TYPE,
  p_valoracion    public.tabla_valoraciones.valoracion%TYPE DEFAULT NULL,
  p_comentario    public.tabla_valoraciones.comentario%TYPE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_filas INT;
BEGIN
  IF p_valoracion IS NOT NULL AND (p_valoracion < 1 OR p_valoracion > 5) THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'VALORACION_INVALID_SCORE',
      'sqlstate', '22023',
      'error', 'La valoración debe estar entre 1 y 5'
    );
  END IF;

  UPDATE public.tabla_valoraciones
  SET
    valoracion          = COALESCE(p_valoracion, valoracion),
    comentario          = CASE
                            WHEN p_comentario IS NOT NULL
                            THEN NULLIF(TRIM(p_comentario), '')
                            ELSE comentario
                          END,
    fecha_actualizacion = CURRENT_TIMESTAMP
  WHERE id_valoracion = p_id_valoracion
    AND id_usuario    = p_id_usuario;

  GET DIAGNOSTICS v_filas = ROW_COUNT;

  IF v_filas = 0 THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'VALORACION_NOT_FOUND_OR_FORBIDDEN',
      'sqlstate', 'P0002',
      'error', 'Valoración no encontrada o sin permisos'
    );
  END IF;

  RETURN jsonb_build_object('ok', TRUE);
EXCEPTION
  WHEN invalid_text_representation OR numeric_value_out_of_range THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'VALORACION_INVALID_FIELD_TYPE',
      'sqlstate',   SQLSTATE,
      'error',      SQLERRM
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

-- ─────────────────────────────────────────────────────────────────────────────
-- fn_valoraciones_eliminar
-- Elimina una valoración (solo el dueño).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION app_api.fn_valoraciones_eliminar(
  p_id_valoracion public.tabla_valoraciones.id_valoracion%TYPE,
  p_id_usuario    public.tabla_valoraciones.id_usuario%TYPE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_filas INT;
BEGIN
  DELETE FROM public.tabla_valoraciones
  WHERE id_valoracion = p_id_valoracion
    AND id_usuario    = p_id_usuario;

  GET DIAGNOSTICS v_filas = ROW_COUNT;

  IF v_filas = 0 THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'VALORACION_NOT_FOUND_OR_FORBIDDEN',
      'sqlstate', 'P0002',
      'error', 'Valoración no encontrada o sin permisos'
    );
  END IF;

  RETURN jsonb_build_object('ok', TRUE);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'DB_ERROR',
      'sqlstate', SQLSTATE,
      'error', SQLERRM
    );
END;
$$;