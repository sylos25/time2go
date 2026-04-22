-- ─────────────────────────────────────────────────────────────────────────────
-- fn_evento_crear
-- Inserta un nuevo evento y todas sus relaciones en una sola transacción.
-- Toda la lógica de relaciones usa CTEs set‑based para minimizar round‑trips.
-- Respuesta: { ok: true,  id_evento, id_publico_evento }
--            { ok: false, error_code, sqlstate, error }
-- ─────────────────────────────────────────────────────────────────────────────

-- Funcion para crear un nuevo evento.

CREATE OR REPLACE FUNCTION app_api.fn_evento_crear(
  p_id_usuario      public.tabla_eventos.id_usuario%TYPE,
  p_evento          JSONB,
  p_telefonos       JSONB DEFAULT '[]'::JSONB,
  p_info_importante JSONB DEFAULT '[]'::JSONB,
  p_boleteria       JSONB DEFAULT '[]'::JSONB,
  p_links           JSONB DEFAULT '[]'::JSONB,
  p_imagenes        JSONB DEFAULT '[]'::JSONB,
  p_documento       JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_id_evento         public.tabla_eventos.id_evento%TYPE;
  v_id_publico_evento public.tabla_eventos.id_publico_evento%TYPE;
  v_info_detalle      public.tabla_evento_informacion_importante.detalle%TYPE;
  v_info_obligatorio  public.tabla_evento_informacion_importante.obligatorio%TYPE;
  v_max_eventos_mes   INT;
  v_max_imagenes      INT;
  v_aforo_minimo      INT;
  v_aforo_maximo      INT;
  v_permite_destacado BOOLEAN;
  v_fecha_inicio_plan TIMESTAMP WITH TIME ZONE;
  v_fecha_fin_plan    TIMESTAMP WITH TIME ZONE;
  v_eventos_creados   INT;
  v_imagenes_payload  INT;
  v_cupo_solicitado   INT;
  v_solicita_destacar BOOLEAN;
BEGIN
  -- ── 1. Validación del payload ─────────────────────────────────────────────
  IF p_evento IS NULL OR COALESCE(jsonb_typeof(p_evento), '') <> 'object' THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'EVENT_INVALID_PAYLOAD',
      'sqlstate',   '22023',
      'error',      'El payload del evento debe ser un objeto JSON'
    );
  END IF;

  -- ── 2. Validaciones por plan de suscripción mensual ───────────────────────
  SELECT
    p.max_eventos_mensuales,
    p.max_imagenes_por_evento,
    p.aforo_minimo,
    p.aforo_maximo,
    p.permite_destacado,
    s.fecha_inicio,
    s.fecha_fin
  INTO
    v_max_eventos_mes,
    v_max_imagenes,
    v_aforo_minimo,
    v_aforo_maximo,
    v_permite_destacado,
    v_fecha_inicio_plan,
    v_fecha_fin_plan
  FROM public.tabla_suscripciones_organizador s
  INNER JOIN public.tabla_planes_organizador p
    ON p.id_plan = s.id_plan
  WHERE s.id_usuario = p_id_usuario
    AND s.estado_suscripcion = 'activa'
    AND p.activo = TRUE
    AND CURRENT_TIMESTAMP >= s.fecha_inicio
    AND CURRENT_TIMESTAMP < s.fecha_fin
  ORDER BY s.fecha_fin DESC
  LIMIT 1;

  IF v_max_eventos_mes IS NULL THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'PLAN_SUBSCRIPTION_REQUIRED',
      'sqlstate',   'P0001',
      'error',      'Debes tener una suscripción activa para crear eventos'
    );
  END IF;

  v_imagenes_payload := CASE
    WHEN COALESCE(jsonb_typeof(p_imagenes), '') = 'array' THEN jsonb_array_length(p_imagenes)
    ELSE 0
  END;

  IF v_imagenes_payload > v_max_imagenes THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'PLAN_IMAGE_LIMIT_EXCEEDED',
      'sqlstate',   'P0001',
      'error',      format('Tu plan permite hasta %s imágenes por evento', v_max_imagenes)
    );
  END IF;

  v_cupo_solicitado := COALESCE((p_evento->>'cupo')::INT, 0);
  IF v_cupo_solicitado < v_aforo_minimo OR v_cupo_solicitado > v_aforo_maximo THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'PLAN_CAPACITY_OUT_OF_RANGE',
      'sqlstate',   'P0001',
      'error',      format('Tu plan permite aforo entre %s y %s personas', v_aforo_minimo, v_aforo_maximo)
    );
  END IF;

  SELECT COUNT(*)::INT
  INTO v_eventos_creados
  FROM public.tabla_eventos e
  WHERE e.id_usuario = p_id_usuario
    AND e.fecha_creacion >= v_fecha_inicio_plan
    AND e.fecha_creacion < v_fecha_fin_plan;

  IF v_eventos_creados >= v_max_eventos_mes THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'PLAN_EVENTS_LIMIT_EXCEEDED',
      'sqlstate',   'P0001',
      'error',      format('Tu plan permite crear hasta %s eventos en la suscripción mensual', v_max_eventos_mes)
    );
  END IF;

  v_solicita_destacar := COALESCE((p_evento->>'destacado')::BOOLEAN, FALSE);
  IF v_solicita_destacar AND NOT v_permite_destacado THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'PLAN_FEATURED_NOT_ALLOWED',
      'sqlstate',   'P0001',
      'error',      'Tu plan no incluye eventos destacados'
    );
  END IF;

  -- ── 3. Preparar datos del documento (si existe) ───────────────────────────
  WITH doc AS (
    SELECT
      CASE WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
           THEN NULLIF(TRIM(p_documento->>'url_documento_evento'), '') END AS url,
      CASE WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
           THEN COALESCE(NULLIF(TRIM(p_documento->>'storage_provider'), ''), 'legacy_url')
           ELSE 'legacy_url' END AS provider,
      CASE WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
           THEN NULLIF(TRIM(p_documento->>'storage_key'), '') END AS key,
      CASE WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
           THEN COALESCE(NULLIF(TRIM(p_documento->>'mime_type'), ''), 'application/pdf')
           ELSE 'application/pdf' END AS mime,
      CASE WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
           THEN NULLIF(p_documento->>'bytes', '')::BIGINT END AS bytes,
      CASE WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
           THEN NULLIF(TRIM(p_documento->>'original_filename'), '') END AS original_name
  )
  -- ── 4. INSERT principal ───────────────────────────────────────────────────
  INSERT INTO public.tabla_eventos (
    nombre_evento,
    pulep_evento,
    responsable_evento,
    id_usuario,
    id_categoria_evento,
    id_tipo_evento,
    id_sitio,
    descripcion,
    fecha_inicio,
    fecha_fin,
    hora_inicio,
    hora_final,
    gratis_pago,
    url_documento_evento,
    documento_storage_provider,
    documento_storage_key,
    documento_mime_type,
    documento_bytes,
    documento_original_filename,
    cupo,
    destacado,
    destacado_por_usuario,
    fecha_destacado,
    reservar_anticipado,
    estado
  )
  SELECT
    p_evento->>'nombre_evento',
    NULLIF(TRIM(p_evento->>'pulep_evento'), ''),
    p_evento->>'responsable_evento',
    p_id_usuario,
    (p_evento->>'id_categoria_evento')::INT,
    (p_evento->>'id_tipo_evento')::INT,
    (p_evento->>'id_sitio')::INT,
    p_evento->>'descripcion',
    (p_evento->>'fecha_inicio')::DATE,
    (p_evento->>'fecha_fin')::DATE,
    (p_evento->>'hora_inicio')::TIME,
    (p_evento->>'hora_final')::TIME,
    COALESCE((p_evento->>'gratis_pago')::BOOLEAN, FALSE),
    doc.url,
    doc.provider,
    doc.key,
    doc.mime,
    doc.bytes,
    doc.original_name,
    COALESCE((p_evento->>'cupo')::INT, 0),
    v_solicita_destacar,
    CASE WHEN v_solicita_destacar THEN p_id_usuario ELSE NULL END,
    CASE WHEN v_solicita_destacar THEN CURRENT_TIMESTAMP ELSE NULL END,
    COALESCE((p_evento->>'reservar_anticipado')::BOOLEAN, FALSE),
    COALESCE((p_evento->>'estado')::BOOLEAN, FALSE)
  FROM doc
  RETURNING id_evento, id_publico_evento
  INTO v_id_evento, v_id_publico_evento;

  -- ── 5. Teléfonos: dedup payload + insert ─────────────────────────────────
  IF COALESCE(jsonb_typeof(p_telefonos), 'array') = 'array' THEN
    WITH telefonos_raw AS (
      SELECT DISTINCT
        NULLIF(REGEXP_REPLACE(TRIM(v.value->>'telefono'), '[^0-9]', '', 'g'), '')::NUMERIC(10,0) AS telefono,
        COALESCE((v.value->>'es_principal')::BOOLEAN, FALSE) AS es_principal
      FROM jsonb_array_elements(p_telefonos) AS v(value)
      WHERE TRIM(v.value->>'telefono') IS NOT NULL
    )
    INSERT INTO public.tabla_eventos_telefonos (id_evento, telefono, es_principal)
    SELECT v_id_evento, telefono, es_principal
    FROM telefonos_raw
    ON CONFLICT (id_evento, telefono) DO UPDATE
      SET es_principal = EXCLUDED.es_principal;
  END IF;

  -- ── 6. Información importante: consolida ítems en fila única ──────────────
  IF COALESCE(jsonb_typeof(p_info_importante), 'array') = 'array' THEN
    WITH info_src AS (
      SELECT
        ROW_NUMBER() OVER (ORDER BY v.ord) AS linea,
        TRIM(v.value->>'detalle') AS detalle,
        COALESCE((v.value->>'obligatorio')::BOOLEAN, FALSE) AS obligatorio
      FROM jsonb_array_elements(p_info_importante) WITH ORDINALITY AS v(value, ord)
      WHERE LENGTH(TRIM(v.value->>'detalle')) >= 5
    )
    SELECT
      COALESCE(STRING_AGG(linea::TEXT || '. ' || detalle, E'\n' ORDER BY linea), ''),
      COALESCE(BOOL_OR(obligatorio), FALSE)
    INTO v_info_detalle, v_info_obligatorio
    FROM info_src;

    IF LENGTH(v_info_detalle) >= 5 THEN
      INSERT INTO public.tabla_evento_informacion_importante (id_evento, detalle, obligatorio)
      VALUES (v_id_evento, v_info_detalle, v_info_obligatorio);
    END IF;
  END IF;

  -- ── 7. Boletería ──────────────────────────────────────────────────────────
  IF COALESCE(jsonb_typeof(p_boleteria), 'array') = 'array' THEN
    WITH boletos_raw AS (
      SELECT DISTINCT ON (LOWER(TRIM(v.value->>'nombre_boleto')))
        TRIM(v.value->>'nombre_boleto') AS nombre_boleto,
        COALESCE(NULLIF(v.value->>'precio_boleto', '')::NUMERIC(9,2), 0) AS precio_boleto,
        COALESCE(NULLIF(v.value->>'servicio', '')::NUMERIC(9,2), 0) AS servicio
      FROM jsonb_array_elements(p_boleteria) AS v(value)
      WHERE LENGTH(TRIM(v.value->>'nombre_boleto')) >= 1
      ORDER BY LOWER(TRIM(v.value->>'nombre_boleto'))
    )
    INSERT INTO public.tabla_boleteria (id_evento, nombre_boleto, precio_boleto, servicio)
    SELECT v_id_evento, nombre_boleto, precio_boleto, servicio
    FROM boletos_raw;
  END IF;

  -- ── 8. Links ──────────────────────────────────────────────────────────────
  IF COALESCE(jsonb_typeof(p_links), 'array') = 'array' THEN
    WITH links_raw AS (
      SELECT DISTINCT
        CASE
          WHEN jsonb_typeof(v.value) = 'string' THEN TRIM(BOTH '"' FROM v.value::TEXT)
          WHEN jsonb_typeof(v.value) = 'object' THEN TRIM(v.value->>'link')
          ELSE NULL
        END AS link
      FROM jsonb_array_elements(p_links) AS v(value)
      WHERE LENGTH(COALESCE(TRIM(CASE WHEN jsonb_typeof(v.value) = 'string' THEN v.value::TEXT ELSE v.value->>'link' END), '')) > 0
    )
    INSERT INTO public.tabla_links (id_evento, link)
    SELECT v_id_evento, link
    FROM links_raw;
  END IF;

  -- ── 9. Imágenes: DISTINCT ON dedup por clave de almacenamiento ────────────
  IF COALESCE(jsonb_typeof(p_imagenes), 'array') = 'array' THEN
    WITH imagenes_payload AS (
      SELECT DISTINCT ON (
        COALESCE(
          NULLIF(TRIM(v.value->>'storage_key'), ''),
          NULLIF(TRIM(v.value->>'url_imagen_evento'), '')
        )
      )
        NULLIF(TRIM(v.value->>'url_imagen_evento'), '')::VARCHAR AS url_imagen_evento,
        COALESCE(NULLIF(TRIM(v.value->>'storage_provider'), ''), 'legacy_url') AS storage_provider,
        NULLIF(TRIM(v.value->>'storage_key'), '')::TEXT AS storage_key,
        COALESCE(NULLIF(TRIM(v.value->>'mime_type'), ''), 'image/jpeg') AS mime_type,
        NULLIF(v.value->>'bytes', '')::BIGINT AS bytes,
        NULLIF(TRIM(v.value->>'original_filename'), '') AS original_filename
      FROM jsonb_array_elements(p_imagenes) AS v(value)
      WHERE NULLIF(TRIM(v.value->>'url_imagen_evento'), '') IS NOT NULL
      ORDER BY COALESCE(NULLIF(TRIM(v.value->>'storage_key'), ''), NULLIF(TRIM(v.value->>'url_imagen_evento'), ''))
    )
    INSERT INTO public.tabla_imagenes_eventos (
      url_imagen_evento, id_evento, storage_provider,
      storage_key, mime_type, bytes, original_filename
    )
    SELECT
      url_imagen_evento, v_id_evento, storage_provider,
      storage_key, mime_type, bytes, original_filename
    FROM imagenes_payload;
  END IF;

  -- ── 10. Retorno exitoso ───────────────────────────────────────────────────
  RETURN jsonb_build_object(
    'ok',                TRUE,
    'id_evento',         v_id_evento,
    'id_publico_evento', v_id_publico_evento
  );

EXCEPTION
  WHEN invalid_text_representation OR numeric_value_out_of_range THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'EVENT_INVALID_FIELD_TYPE',
      'sqlstate',   SQLSTATE,
      'error',      SQLERRM
    );
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'EVENT_DUPLICATE_RESOURCE',
      'sqlstate',   SQLSTATE,
      'error',      SQLERRM
    );
  WHEN foreign_key_violation THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'EVENT_INVALID_REFERENCE',
      'sqlstate',   SQLSTATE,
      'error',      'Uno de los identificadores referenciados (categoría, tipo, sitio, usuario) no existe'
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