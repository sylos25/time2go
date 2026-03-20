-- ─────────────────────────────────────────────────────────────────────────────
-- fn_evento_actualizar
-- Actualiza un evento existente y sincroniza todas sus relaciones en una sola
-- transacción. Toda la lógica de relaciones usa CTEs set-based para minimizar
-- round-trips y mantener la consistencia.
-- Respuesta: { ok: true,  event: {...} }
--            { ok: false, error_code, sqlstate, error }
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION app_api.fn_evento_actualizar(
  p_id_evento             tabla_eventos.id_evento%TYPE,
  p_id_usuario_editor     tabla_usuarios.id_usuario%TYPE,
  p_evento                JSONB,
  p_telefonos             JSONB DEFAULT '[]'::JSONB,
  p_info_importante       JSONB DEFAULT '[]'::JSONB,
  p_boleteria             JSONB DEFAULT '[]'::JSONB,
  p_links                 JSONB DEFAULT '[]'::JSONB,
  p_imagenes_nuevas       JSONB DEFAULT '[]'::JSONB,
  p_ids_imagenes_eliminar INT[] DEFAULT '{}'::INT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public, app_api, pg_temp
AS $$
DECLARE
  v_info_detalle     tabla_evento_informacion_importante.detalle%TYPE     := '';
  v_info_obligatorio tabla_evento_informacion_importante.obligatorio%TYPE := FALSE;
  v_evento           JSONB;
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

  -- ── 2. Contexto de auditoría (leído por los triggers de auditoría) ────────
  PERFORM set_config('app.id_usuario', p_id_usuario_editor::TEXT, TRUE);

  -- ── 3. Bloqueo pesimista – garantiza actualización atómica ────────────────
  PERFORM 1
  FROM  tabla_eventos
  WHERE id_evento = p_id_evento
  FOR   UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok',         FALSE,
      'error_code', 'EVENT_NOT_FOUND',
      'sqlstate',   'P0002',
      'error',      'Evento no encontrado'
    );
  END IF;

  -- ── 4. Actualización principal + captura del estado post-update ──────────
  UPDATE tabla_eventos e
  SET
    nombre_evento       = COALESCE(NULLIF(BTRIM(p_evento->>'nombre_evento'),       ''), e.nombre_evento),
    pulep_evento        = CASE
                            WHEN p_evento ? 'pulep_evento'
                            THEN NULLIF(BTRIM(p_evento->>'pulep_evento'), '')
                            ELSE e.pulep_evento
                          END,
    responsable_evento  = COALESCE(NULLIF(BTRIM(p_evento->>'responsable_evento'),  ''), e.responsable_evento),
    id_categoria_evento = COALESCE(NULLIF(p_evento->>'id_categoria_evento',        '')::INT,     e.id_categoria_evento),
    id_tipo_evento      = COALESCE(NULLIF(p_evento->>'id_tipo_evento',             '')::INT,     e.id_tipo_evento),
    id_sitio            = COALESCE(NULLIF(p_evento->>'id_sitio',                   '')::INT,     e.id_sitio),
    descripcion         = COALESCE(NULLIF(BTRIM(p_evento->>'descripcion'),         ''), e.descripcion),
    fecha_inicio        = COALESCE(NULLIF(p_evento->>'fecha_inicio',               '')::DATE,    e.fecha_inicio),
    fecha_fin           = COALESCE(NULLIF(p_evento->>'fecha_fin',                  '')::DATE,    e.fecha_fin),
    hora_inicio         = COALESCE(NULLIF(p_evento->>'hora_inicio',                '')::TIME,    e.hora_inicio),
    hora_final          = COALESCE(NULLIF(p_evento->>'hora_final',                 '')::TIME,    e.hora_final),
    gratis_pago         = COALESCE(NULLIF(p_evento->>'gratis_pago',                '')::BOOLEAN, e.gratis_pago),
    cupo                = COALESCE(NULLIF(p_evento->>'cupo',                       '')::INT,     e.cupo),
    reservar_anticipado = COALESCE(NULLIF(p_evento->>'reservar_anticipado',        '')::BOOLEAN, e.reservar_anticipado),
    estado              = COALESCE(NULLIF(p_evento->>'estado',                     '')::BOOLEAN, e.estado),
    fecha_actualizacion = CURRENT_TIMESTAMP
  WHERE e.id_evento = p_id_evento
  RETURNING jsonb_build_object(
    'id_evento',           e.id_evento,
    'id_publico_evento',   e.id_publico_evento,
    'pulep_evento',        e.pulep_evento,
    'nombre_evento',       e.nombre_evento,
    'responsable_evento',  e.responsable_evento,
    'id_usuario',          e.id_usuario,
    'id_categoria_evento', e.id_categoria_evento,
    'id_tipo_evento',      e.id_tipo_evento,
    'id_sitio',            e.id_sitio,
    'descripcion',         e.descripcion,
    'fecha_inicio',        e.fecha_inicio,
    'fecha_fin',           e.fecha_fin,
    'hora_inicio',         e.hora_inicio,
    'hora_final',          e.hora_final,
    'gratis_pago',         e.gratis_pago,
    'cupo',                e.cupo,
    'reservar_anticipado', e.reservar_anticipado,
    'estado',              e.estado,
    'motivo_rechazo',      e.motivo_rechazo,
    'rechazo_por',         e.rechazo_por,
    'destacado',           e.destacado,
    'destacado_por',       e.destacado_por,
    'fecha_destacado',     e.fecha_destacado,
    'fecha_creacion',      e.fecha_creacion,
    'fecha_actualizacion', e.fecha_actualizacion,
    'fecha_desactivacion', e.fecha_desactivacion
  ) INTO v_evento;

  -- ── 5. Teléfonos: upsert + purga de eliminados ────────────────────────────
  -- JSON parseado una sola vez en telefonos_raw; reutilizado por upsert y delete.
  IF COALESCE(jsonb_typeof(p_telefonos), 'array') = 'array' THEN
    WITH telefonos_raw AS (
      SELECT
        NULLIF(
          regexp_replace(COALESCE(v.value->>'telefono', ''), '[^0-9]', '', 'g'),
          ''
        )::NUMERIC(10,0) AS telefono,
        COALESCE((v.value->>'es_principal')::BOOLEAN, FALSE) AS es_principal
      FROM jsonb_array_elements(p_telefonos) AS v(value)
    ),
    telefonos_validos AS (
      SELECT  telefono,
              bool_or(es_principal) AS es_principal
      FROM    telefonos_raw
      WHERE   telefono IS NOT NULL
      GROUP   BY telefono
    ),
    upsert_tel AS (
      INSERT INTO tabla_eventos_telefonos (id_evento, telefono, es_principal)
      SELECT p_id_evento, tv.telefono, tv.es_principal
      FROM   telefonos_validos tv
      ON CONFLICT (id_evento, telefono)
      DO UPDATE SET es_principal = EXCLUDED.es_principal
      RETURNING 1
    )
    DELETE FROM tabla_eventos_telefonos et
    WHERE  et.id_evento = p_id_evento
      AND  NOT EXISTS (
             SELECT 1 FROM telefonos_validos tv
             WHERE  tv.telefono = et.telefono
           );
  END IF;

  -- ── 6. Información importante: consolida ítems en fila única ────────────
  -- WITH ORDINALITY preserva el orden original del array JSON.
  -- string_agg construye el detalle numerado sin loops procedurales.
  IF COALESCE(jsonb_typeof(p_info_importante), 'array') = 'array' THEN
    WITH info_src AS (
      SELECT
        row_number() OVER (ORDER BY v.ord) AS linea,
        BTRIM(v.value->>'detalle')                              AS detalle,
        COALESCE((v.value->>'obligatorio')::BOOLEAN, FALSE)     AS obligatorio
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
    VALUES (p_id_evento, v_info_detalle, v_info_obligatorio)
    ON CONFLICT (id_evento)
    DO UPDATE SET
      detalle             = EXCLUDED.detalle,
      obligatorio         = EXCLUDED.obligatorio,
      fecha_actualizacion = CURRENT_TIMESTAMP;
  ELSE
    DELETE FROM tabla_evento_informacion_importante
    WHERE  id_evento = p_id_evento;
  END IF;

  -- ── 7. Boletería: insert nuevos + purga de eliminados ───────────────────
  -- nombre_key normaliza a lower para comparación case-insensitive.
  -- IS NOT DISTINCT FROM evita falsos no-match por NULL en precio/servicio.
  IF COALESCE(jsonb_typeof(p_boleteria), 'array') = 'array' THEN
    WITH boletos_raw AS (
      SELECT
        lower(BTRIM(v.value->>'nombre_boleto'))                                                AS nombre_key,
              BTRIM(v.value->>'nombre_boleto')                                                 AS nombre_boleto,
        COALESCE(NULLIF(v.value->>'precio_boleto', '')::NUMERIC(9,2), 0) AS precio_boleto,
        COALESCE(NULLIF(v.value->>'servicio',       '')::NUMERIC(9,2), 0) AS servicio
      FROM jsonb_array_elements(p_boleteria) AS v(value)
      WHERE char_length(BTRIM(COALESCE(v.value->>'nombre_boleto', ''))) >= 1
    ),
    boletos_validos AS (
      SELECT  nombre_key,
              min(nombre_boleto) AS nombre_boleto,
              precio_boleto,
              servicio
      FROM    boletos_raw
      GROUP   BY nombre_key, precio_boleto, servicio
    ),
    insert_bol AS (
      INSERT INTO tabla_boleteria (id_evento, nombre_boleto, precio_boleto, servicio)
      SELECT p_id_evento, bv.nombre_boleto, bv.precio_boleto, bv.servicio
      FROM   boletos_validos bv
      WHERE  NOT EXISTS (
               SELECT 1 FROM tabla_boleteria b
               WHERE  b.id_evento            = p_id_evento
                 AND  lower(b.nombre_boleto) = bv.nombre_key
                 AND  b.precio_boleto        IS NOT DISTINCT FROM bv.precio_boleto
                 AND  COALESCE(b.servicio, 0) = bv.servicio
             )
      RETURNING 1
    )
    DELETE FROM tabla_boleteria b
    WHERE  b.id_evento = p_id_evento
      AND  NOT EXISTS (
             SELECT 1 FROM boletos_validos bv
             WHERE  bv.nombre_key       = lower(b.nombre_boleto)
               AND  bv.precio_boleto    IS NOT DISTINCT FROM b.precio_boleto
               AND  bv.servicio         = COALESCE(b.servicio, 0)
           );
  END IF;

  -- ── 8. Links: insert nuevos + purga de eliminados ───────────────────────
  -- links_raw evalúa la variante (string/object) una sola vez.
  -- links_validos deduplica y aplica %TYPE cast al tipo real de la columna.
  IF COALESCE(jsonb_typeof(p_links), 'array') = 'array' THEN
    WITH links_raw AS (
      SELECT
        CASE
          WHEN jsonb_typeof(v.value) = 'string' THEN TRIM(BOTH '"' FROM v.value::TEXT)
          WHEN jsonb_typeof(v.value) = 'object' THEN v.value->>'link'
          ELSE NULL
        END AS raw_link
      FROM jsonb_array_elements(p_links) AS v(value)
    ),
    links_validos AS (
      SELECT DISTINCT BTRIM(raw_link)::TEXT AS link
      FROM   links_raw
      WHERE  char_length(COALESCE(BTRIM(raw_link), '')) > 0
    ),
    insert_lnk AS (
      INSERT INTO tabla_links (id_evento, link)
      SELECT p_id_evento, lv.link
      FROM   links_validos lv
      WHERE  NOT EXISTS (
               SELECT 1 FROM tabla_links l
               WHERE  l.id_evento = p_id_evento
                 AND  l.link      = lv.link
             )
      RETURNING 1
    )
    DELETE FROM tabla_links l
    WHERE  l.id_evento = p_id_evento
      AND  NOT EXISTS (
             SELECT 1 FROM links_validos lv WHERE lv.link = l.link
           );
  END IF;

  -- ── 9. Imágenes: eliminar las marcadas explícitamente ────────────────────
  IF cardinality(p_ids_imagenes_eliminar) > 0 THEN
    DELETE FROM tabla_imagenes_eventos
    WHERE  id_evento      = p_id_evento
      AND  id_imagen_evento = ANY(p_ids_imagenes_eliminar);
  END IF;

  -- ── 10. Imágenes: insertar nuevas sin duplicar (set-based, sin loop) ──────
  -- DISTINCT ON deduplica por clave de almacenamiento antes del INSERT.
  -- NOT EXISTS evita colisión con imágenes que ya existen para el evento.
  IF COALESCE(jsonb_typeof(p_imagenes_nuevas), 'array') = 'array' THEN
    WITH imagenes_payload AS (
      SELECT DISTINCT ON (
        COALESCE(
          NULLIF(BTRIM(v.value->>'storage_key'),        ''),
          NULLIF(BTRIM(v.value->>'url_imagen_evento'),  '')
        )
      )
        NULLIF(BTRIM(v.value->>'url_imagen_evento'),  '')::VARCHAR AS url_imagen_evento,
        COALESCE(NULLIF(BTRIM(v.value->>'storage_provider'), ''), 'legacy_url')                         AS storage_provider,
        NULLIF(BTRIM(v.value->>'storage_key'),        '')::TEXT        AS storage_key,
        COALESCE(NULLIF(BTRIM(v.value->>'mime_type'), ''), 'image/jpeg')                                 AS mime_type,
        NULLIF(v.value->>'bytes', '')::BIGINT                                  AS bytes,
        NULLIF(BTRIM(v.value->>'original_filename'),  '')                                                 AS original_filename
      FROM jsonb_array_elements(p_imagenes_nuevas) AS v(value)
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
      ip.url_imagen_evento, p_id_evento, ip.storage_provider,
      ip.storage_key, ip.mime_type, ip.bytes, ip.original_filename
    FROM   imagenes_payload ip
    WHERE  NOT EXISTS (
             SELECT 1 FROM tabla_imagenes_eventos i
             WHERE  i.id_evento = p_id_evento
               AND  (
                     (ip.storage_key IS NOT NULL AND i.storage_key = ip.storage_key)
                     OR i.url_imagen_evento = ip.url_imagen_evento
                    )
           );
  END IF;

  -- ── 11. Retorno exitoso ───────────────────────────────────────────────────
  RETURN jsonb_build_object('ok', TRUE, 'event', v_evento);

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