-- ── 1. OBTENER valoraciones del usuario ─────────────────────────────────────
CREATE OR REPLACE FUNCTION app_api.fn_valoraciones_obtener(
  p_id_usuario tabla_valoraciones.id_usuario%TYPE
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public, app_api, pg_temp
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
      'imagen_evento',       img.url_imagen_evento
    )
    ORDER BY v.fecha_creacion DESC
  )
  INTO v_resultado
  FROM tabla_valoraciones v
  JOIN tabla_eventos e ON v.id_evento = e.id_evento
  LEFT JOIN LATERAL (
    SELECT i.url_imagen_evento
    FROM tabla_imagenes_eventos i
    WHERE i.id_evento = e.id_evento
    ORDER BY i.id_imagen_evento ASC
    LIMIT 1
  ) img ON TRUE
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


-- ── 2. CREAR una valoración ──────────────────────────────────────────────────
DROP FUNCTION IF EXISTS app_api.fn_valoraciones_crear(INT, INT, NUMERIC, TEXT);

CREATE OR REPLACE FUNCTION app_api.fn_valoraciones_crear(
  p_id_usuario tabla_valoraciones.id_usuario%TYPE,
  p_id_evento  tabla_valoraciones.id_evento%TYPE,
  p_valoracion tabla_valoraciones.valoracion%TYPE,   -- ej. 1–5
  p_comentario tabla_valoraciones.comentario%TYPE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public, app_api, pg_temp
AS $$
DECLARE
  v_id_valoracion tabla_valoraciones.id_valoracion%TYPE;
BEGIN
  -- Validar rango de valoración
  IF p_valoracion < 1 OR p_valoracion > 5 THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'VALORACION_INVALID_SCORE',
      'sqlstate', '22023',
      'error', 'La valoracion debe estar entre 1 y 5'
    );
  END IF;

  INSERT INTO tabla_valoraciones (
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
    NULLIF(BTRIM(COALESCE(p_comentario, '')), ''),
    NOW(),
    NOW()
  )
  RETURNING id_valoracion INTO v_id_valoracion;

  RETURN jsonb_build_object(
    'ok',            TRUE,
    'id_valoracion', v_id_valoracion
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'VALORACION_ALREADY_EXISTS',
      'sqlstate', SQLSTATE,
      'error', 'Ya existe una valoracion para este evento'
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


-- ── 3. ACTUALIZAR una valoración ─────────────────────────────────────────────
DROP FUNCTION IF EXISTS app_api.fn_valoraciones_actualizar(INT, INT, NUMERIC, TEXT);

CREATE OR REPLACE FUNCTION app_api.fn_valoraciones_actualizar(
  p_id_valoracion tabla_valoraciones.id_valoracion%TYPE,
  p_id_usuario    tabla_valoraciones.id_usuario%TYPE,          -- para verificar propiedad
  p_valoracion    tabla_valoraciones.valoracion%TYPE DEFAULT NULL,
  p_comentario    tabla_valoraciones.comentario%TYPE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public, app_api, pg_temp
AS $$
DECLARE
  v_filas INT;
BEGIN
  IF p_valoracion IS NOT NULL AND (p_valoracion < 1 OR p_valoracion > 5) THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'VALORACION_INVALID_SCORE',
      'sqlstate', '22023',
      'error', 'La valoracion debe estar entre 1 y 5'
    );
  END IF;

  UPDATE tabla_valoraciones
  SET
    valoracion          = COALESCE(p_valoracion, valoracion),
    comentario          = CASE
                            WHEN p_comentario IS NOT NULL
                            THEN NULLIF(BTRIM(p_comentario), '')
                            ELSE comentario
                          END,
    fecha_actualizacion = NOW()
  WHERE id_valoracion = p_id_valoracion
    AND id_usuario    = p_id_usuario;   -- solo el dueño puede editar

  GET DIAGNOSTICS v_filas = ROW_COUNT;

  IF v_filas = 0 THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'VALORACION_NOT_FOUND_OR_FORBIDDEN',
      'sqlstate', 'P0002',
      'error', 'Valoracion no encontrada o sin permisos'
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', TRUE
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


-- ── 4. ELIMINAR una valoración ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION app_api.fn_valoraciones_eliminar(
  p_id_valoracion tabla_valoraciones.id_valoracion%TYPE,
  p_id_usuario    tabla_valoraciones.id_usuario%TYPE           -- para verificar propiedad
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public, app_api, pg_temp
AS $$
DECLARE
  v_filas INT;
BEGIN
  DELETE FROM tabla_valoraciones
  WHERE id_valoracion = p_id_valoracion
    AND id_usuario    = p_id_usuario;

  GET DIAGNOSTICS v_filas = ROW_COUNT;

  IF v_filas = 0 THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'VALORACION_NOT_FOUND_OR_FORBIDDEN',
      'sqlstate', 'P0002',
      'error', 'Valoracion no encontrada o sin permisos'
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', TRUE
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