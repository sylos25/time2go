--Funcion para crear un nuevo evento, con sus datos principales y relaciones.
-- ─────────────────────────────────────────────────────────────────────────────
-- fn_evento_crear
-- Inserta un nuevo evento y todas sus relaciones en una sola transacción.
-- Toda la lógica de relaciones usa CTEs set-based para minimizar round-trips.
-- Respuesta: { ok: true,  id_evento, id_publico_evento }
--            { ok: false, error_code, sqlstate, error }
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION app_api.fn_evento_crear(
  p_id_usuario      tabla_eventos.id_usuario%TYPE,
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
SET search_path = public, app_api, pg_temp
AS $$
DECLARE
  v_id_evento         tabla_eventos.id_evento%TYPE;
  v_id_publico_evento tabla_eventos.id_publico_evento%TYPE;
  v_info_detalle      tabla_evento_informacion_importante.detalle%TYPE     := '';
  v_info_obligatorio  tabla_evento_informacion_importante.obligatorio%TYPE := FALSE;
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

  -- ── 2. INSERT principal ───────────────────────────────────────────────────
  INSERT INTO tabla_eventos (
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
    reservar_anticipado,
    estado
  ) VALUES (
    p_evento->>'nombre_evento',
    NULLIF(BTRIM(p_evento->>'pulep_evento'), ''),
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
    CASE WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
         THEN NULLIF(BTRIM(p_documento->>'url_documento_evento'), '')     ELSE NULL END,
    CASE WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
         THEN COALESCE(NULLIF(BTRIM(p_documento->>'storage_provider'), ''), 'legacy_url')
         ELSE 'legacy_url' END,
    CASE WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
         THEN NULLIF(BTRIM(p_documento->>'storage_key'), '')               ELSE NULL END,
    CASE WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
         THEN COALESCE(NULLIF(BTRIM(p_documento->>'mime_type'), ''), 'application/pdf')
         ELSE 'application/pdf' END,
    CASE WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
         THEN NULLIF(p_documento->>'bytes', '')::BIGINT                    ELSE NULL END,
    CASE WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
         THEN NULLIF(BTRIM(p_documento->>'original_filename'), '')         ELSE NULL END,
    COALESCE((p_evento->>'cupo')::INT, 0),
    COALESCE((p_evento->>'reservar_anticipado')::BOOLEAN, FALSE),
    COALESCE((p_evento->>'estado')::BOOLEAN, FALSE)
  )
  RETURNING id_evento, id_publico_evento
  INTO v_id_evento, v_id_publico_evento;

  -- ── 3. Teléfonos: dedup payload + insert ─────────────────────────────────
  -- [^0-9] descarta no-dígitos; GROUP BY deduplica teléfonos repetidos en payload.
  IF COALESCE(jsonb_typeof(p_telefonos), 'array') = 'array' THEN
    WITH telefonos_raw AS (
      SELECT
        NULLIF(
          regexp_replace(COALESCE(v.value->>'telefono', ''), '[^0-9]', '', 'g'),
          ''
        )::tabla_eventos_telefonos.telefono%TYPE AS telefono,
        COALESCE((v.value->>'es_principal')::BOOLEAN, FALSE)              AS es_principal
      FROM jsonb_array_elements(p_telefonos) AS v(value)
    )
    INSERT INTO tabla_eventos_telefonos (id_evento, telefono, es_principal)
    SELECT v_id_evento, telefono, bool_or(es_principal)
    FROM   telefonos_raw
    WHERE  telefono IS NOT NULL
    GROUP  BY telefono
    ON CONFLICT (id_evento, telefono) DO UPDATE
      SET es_principal = EXCLUDED.es_principal;
  END IF;

  -- ── 4. Información importante ─────────────────────────────────────────────
  -- WITH ORDINALITY preserva el orden original; string_agg construye el detalle.
  IF COALESCE(jsonb_typeof(p_info_importante), 'array') = 'array' THEN
    WITH info_src AS (
      SELECT
        row_number() OVER (ORDER BY v.ord) AS linea,
        BTRIM(v.value->>'detalle')                          AS detalle,
        COALESCE((v.value->>'obligatorio')::BOOLEAN, FALSE) AS obligatorio
      FROM jsonb_array_elements(p_info_importante) WITH ORDINALITY AS v(value, ord)
      WHERE char_length(COALESCE(BTRIM(v.value->>'detalle'), '')) >= 5
    )
    SELECT
      COALESCE(string_agg(linea::TEXT || '. ' || detalle, E'\n' ORDER BY linea), ''),
      COALESCE(bool_or(obligatorio), FALSE)
    INTO v_info_detalle, v_info_obligatorio
    FROM info_src;
  END IF;

  IF char_length(v_info_detalle) >= 5 THEN
    INSERT INTO tabla_evento_informacion_importante (id_evento, detalle, obligatorio)
    VALUES (v_id_evento, v_info_detalle, v_info_obligatorio);
  END IF;

  -- ── 5. Boletería ──────────────────────────────────────────────────────────
  -- nombre_key en lower para deduplicar case-insensitive dentro del payload.
  IF COALESCE(jsonb_typeof(p_boleteria), 'array') = 'array' THEN
    WITH boletos_raw AS (
      SELECT
        lower(BTRIM(v.value->>'nombre_boleto'))                                                AS nombre_key,
              BTRIM(v.value->>'nombre_boleto')                                                 AS nombre_boleto,
        COALESCE(NULLIF(v.value->>'precio_boleto', '')::tabla_boleteria.precio_boleto%TYPE, 0) AS precio_boleto,
        COALESCE(NULLIF(v.value->>'servicio',       '')::tabla_boleteria.servicio%TYPE,     0) AS servicio
      FROM jsonb_array_elements(p_boleteria) AS v(value)
      WHERE char_length(BTRIM(COALESCE(v.value->>'nombre_boleto', ''))) >= 1
    )
    INSERT INTO tabla_boleteria (id_evento, nombre_boleto, precio_boleto, servicio)
    SELECT v_id_evento, min(nombre_boleto), precio_boleto, servicio
    FROM   boletos_raw
    GROUP  BY nombre_key, precio_boleto, servicio;
  END IF;

  -- ── 6. Links ──────────────────────────────────────────────────────────────
  -- links_raw evalúa la variante (string/object) una sola vez en el CTE.
  IF COALESCE(jsonb_typeof(p_links), 'array') = 'array' THEN
    WITH links_raw AS (
      SELECT
        CASE
          WHEN jsonb_typeof(v.value) = 'string' THEN TRIM(BOTH '"' FROM v.value::TEXT)
          WHEN jsonb_typeof(v.value) = 'object' THEN v.value->>'link'
          ELSE NULL
        END AS raw_link
      FROM jsonb_array_elements(p_links) AS v(value)
    )
    INSERT INTO tabla_links (id_evento, link)
    SELECT DISTINCT v_id_evento, BTRIM(raw_link)::tabla_links.link%TYPE
    FROM   links_raw
    WHERE  char_length(COALESCE(BTRIM(raw_link), '')) > 0;
  END IF;

  -- ── 7. Imágenes: DISTINCT ON dedup por clave de almacenamiento ────────────
  IF COALESCE(jsonb_typeof(p_imagenes), 'array') = 'array' THEN
    WITH imagenes_payload AS (
      SELECT DISTINCT ON (
        COALESCE(
          NULLIF(BTRIM(v.value->>'storage_key'),       ''),
          NULLIF(BTRIM(v.value->>'url_imagen_evento'), '')
        )
      )
        NULLIF(BTRIM(v.value->>'url_imagen_evento'),  '')::tabla_imagenes_eventos.url_imagen_evento%TYPE AS url_imagen_evento,
        COALESCE(NULLIF(BTRIM(v.value->>'storage_provider'), ''), 'legacy_url')                         AS storage_provider,
        NULLIF(BTRIM(v.value->>'storage_key'),        '')::tabla_imagenes_eventos.storage_key%TYPE       AS storage_key,
        COALESCE(NULLIF(BTRIM(v.value->>'mime_type'), ''), 'image/jpeg')                                 AS mime_type,
        NULLIF(v.value->>'bytes', '')::tabla_imagenes_eventos.bytes%TYPE                                 AS bytes,
        NULLIF(BTRIM(v.value->>'original_filename'),  '')                                                AS original_filename
      FROM jsonb_array_elements(p_imagenes) AS v(value)
      WHERE NULLIF(BTRIM(v.value->>'url_imagen_evento'), '') IS NOT NULL
      ORDER BY COALESCE(
        NULLIF(BTRIM(v.value->>'storage_key'),       ''),
        NULLIF(BTRIM(v.value->>'url_imagen_evento'), '')
      )
    )
    INSERT INTO tabla_imagenes_eventos (
      url_imagen_evento, id_evento, storage_provider,
      storage_key, mime_type, bytes, original_filename
    )
    SELECT
      ip.url_imagen_evento, v_id_evento, ip.storage_provider,
      ip.storage_key, ip.mime_type, ip.bytes, ip.original_filename
    FROM imagenes_payload ip;
  END IF;

  -- ── 8. Retorno exitoso ────────────────────────────────────────────────────
  RETURN jsonb_build_object(
    'ok',                TRUE,
    'id_evento',         v_id_evento,
    'id_publico_evento', v_id_publico_evento
  );
EXCEPTION
  WHEN invalid_text_representation
    OR numeric_value_out_of_range THEN
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
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'DB_ERROR',
      'sqlstate',   SQLSTATE,
      'error',      SQLERRM
    );
END;
$$;