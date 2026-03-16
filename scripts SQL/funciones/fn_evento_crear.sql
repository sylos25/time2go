--Funcion para crear un nuevo evento, con sus datos principales y relaciones.

CREATE OR REPLACE FUNCTION app_api.fn_evento_crear(
  p_id_usuario tabla_eventos.id_usuario%TYPE,
  p_evento JSONB,
  p_telefonos JSONB DEFAULT '[]'::JSONB,
  p_info_importante JSONB DEFAULT '[]'::JSONB,
  p_boleteria JSONB DEFAULT '[]'::JSONB,
  p_links JSONB DEFAULT '[]'::JSONB,
  p_imagenes JSONB DEFAULT '[]'::JSONB,
  p_documento JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public, app_api, pg_temp
AS $$
DECLARE
  v_id_evento tabla_eventos.id_evento%TYPE;
  v_id_publico_evento tabla_eventos.id_publico_evento%TYPE;
  v_tel JSONB;
  v_info JSONB;
  v_boleto JSONB;
  v_link JSONB;
  v_imagen JSONB;
  v_info_detalle tabla_evento_informacion_importante.detalle%TYPE := '';
  v_info_obligatorio tabla_evento_informacion_importante.obligatorio%TYPE := FALSE;
  v_line_no INT := 0;
  v_raw_link tabla_links.link%TYPE;
  v_links_sync tabla_links.link%TYPE[] := ARRAY[]::TEXT[];
  v_img_url tabla_imagenes_eventos.url_imagen_evento%TYPE;
  v_img_storage_key tabla_imagenes_eventos.storage_key%TYPE;
  v_img_mime_type tabla_imagenes_eventos.mime_type%TYPE;
  v_img_bytes tabla_imagenes_eventos.bytes%TYPE;
  v_img_original_filename tabla_imagenes_eventos.original_filename%TYPE;
  v_img_storage_provider tabla_imagenes_eventos.storage_provider%TYPE;
  v_imagenes_sync TEXT[] := ARRAY[]::TEXT[];
  v_img_key TEXT;
BEGIN
  IF p_evento IS NULL OR COALESCE(jsonb_typeof(p_evento), '') <> 'object' THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'EVENT_INVALID_PAYLOAD',
      'sqlstate', '22023',
      'error', 'El payload del evento debe ser un objeto JSON'
    );
  END IF;

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
    CASE
      WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
        THEN NULLIF(BTRIM(p_documento->>'url_documento_evento'), '')
      ELSE NULL
    END,
    CASE
      WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
        THEN COALESCE(NULLIF(BTRIM(p_documento->>'storage_provider'), ''), 'legacy_url')
      ELSE 'legacy_url'
    END,
    CASE
      WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
        THEN NULLIF(BTRIM(p_documento->>'storage_key'), '')
      ELSE NULL
    END,
    CASE
      WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
        THEN COALESCE(NULLIF(BTRIM(p_documento->>'mime_type'), ''), 'application/pdf')
      ELSE 'application/pdf'
    END,
    CASE
      WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
        THEN NULLIF(p_documento->>'bytes', '')::BIGINT
      ELSE NULL
    END,
    CASE
      WHEN p_documento IS NOT NULL AND jsonb_typeof(p_documento) = 'object'
        THEN NULLIF(BTRIM(p_documento->>'original_filename'), '')
      ELSE NULL
    END,
    COALESCE((p_evento->>'cupo')::INT, 0),
    COALESCE((p_evento->>'reservar_anticipado')::BOOLEAN, FALSE),
    COALESCE((p_evento->>'estado')::BOOLEAN, FALSE)
  )
  RETURNING id_evento, id_publico_evento
  INTO v_id_evento, v_id_publico_evento;

  -- Phones
  IF COALESCE(jsonb_typeof(p_telefonos), 'array') = 'array' THEN
    FOR v_tel IN SELECT value FROM jsonb_array_elements(p_telefonos)
    LOOP
      IF NULLIF(regexp_replace(COALESCE(v_tel->>'telefono', ''), '\\D', '', 'g'), '') IS NOT NULL THEN
        INSERT INTO tabla_eventos_telefonos (
          id_evento,
          telefono,
          es_principal
        ) VALUES (
          v_id_evento,
          regexp_replace(v_tel->>'telefono', '\\D', '', 'g')::NUMERIC,
          COALESCE((v_tel->>'es_principal')::BOOLEAN, FALSE)
        )
        ON CONFLICT (id_evento, telefono)
        DO UPDATE SET es_principal = EXCLUDED.es_principal;
      END IF;
    END LOOP;
  END IF;

  -- Important info array -> single row format used by current model
  IF COALESCE(jsonb_typeof(p_info_importante), 'array') = 'array' THEN
    FOR v_info IN SELECT value FROM jsonb_array_elements(p_info_importante)
    LOOP
      IF char_length(COALESCE(BTRIM(v_info->>'detalle'), '')) >= 5 THEN
        v_line_no := v_line_no + 1;
        v_info_detalle := v_info_detalle || CASE WHEN v_info_detalle = '' THEN '' ELSE E'\n' END
          || v_line_no::TEXT || '. ' || BTRIM(v_info->>'detalle');
        v_info_obligatorio := v_info_obligatorio OR COALESCE((v_info->>'obligatorio')::BOOLEAN, FALSE);
      END IF;
    END LOOP;
  END IF;

  IF char_length(v_info_detalle) >= 5 THEN
    INSERT INTO tabla_evento_informacion_importante (
      id_evento,
      detalle,
      obligatorio
    ) VALUES (
      v_id_evento,
      v_info_detalle,
      v_info_obligatorio
    );
  END IF;

  -- Ticket rows
  IF COALESCE(jsonb_typeof(p_boleteria), 'array') = 'array' THEN
    FOR v_boleto IN SELECT value FROM jsonb_array_elements(p_boleteria)
    LOOP
      IF char_length(COALESCE(BTRIM(v_boleto->>'nombre_boleto'), '')) >= 1 THEN
        INSERT INTO tabla_boleteria (
          id_evento,
          nombre_boleto,
          precio_boleto,
          servicio
        ) VALUES (
          v_id_evento,
          BTRIM(v_boleto->>'nombre_boleto'),
          COALESCE(NULLIF(v_boleto->>'precio_boleto', '')::NUMERIC, 0),
          COALESCE(NULLIF(v_boleto->>'servicio', '')::NUMERIC, 0)
        );
      END IF;
    END LOOP;
  END IF;

  -- Links (accept plain JSON string value or object {link})
  IF COALESCE(jsonb_typeof(p_links), 'array') = 'array' THEN
    FOR v_link IN SELECT value FROM jsonb_array_elements(p_links)
    LOOP
      v_raw_link := NULL;
      IF jsonb_typeof(v_link) = 'string' THEN
        v_raw_link := TRIM(BOTH '"' FROM v_link::TEXT);
      ELSIF jsonb_typeof(v_link) = 'object' THEN
        v_raw_link := v_link->>'link';
      END IF;

      IF char_length(COALESCE(BTRIM(v_raw_link), '')) > 0 THEN
        v_raw_link := BTRIM(v_raw_link);

        IF NOT (v_raw_link = ANY(v_links_sync)) THEN
          v_links_sync := array_append(v_links_sync, v_raw_link);
        END IF;

        IF NOT EXISTS (
          SELECT 1
          FROM tabla_links
          WHERE id_evento = v_id_evento
            AND link = v_raw_link
        ) THEN
          INSERT INTO tabla_links (id_evento, link)
          VALUES (v_id_evento, v_raw_link);
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- Images metadata rows (dedupe payload + dedupe against current event)
  IF COALESCE(jsonb_typeof(p_imagenes), 'array') = 'array' THEN
    FOR v_imagen IN SELECT value FROM jsonb_array_elements(p_imagenes)
    LOOP
      v_img_url := NULLIF(BTRIM(v_imagen->>'url_imagen_evento'), '');

      IF v_img_url IS NOT NULL THEN
        v_img_storage_provider := COALESCE(NULLIF(BTRIM(v_imagen->>'storage_provider'), ''), 'legacy_url');
        v_img_storage_key := NULLIF(BTRIM(v_imagen->>'storage_key'), '');
        v_img_mime_type := COALESCE(NULLIF(BTRIM(v_imagen->>'mime_type'), ''), 'image/jpeg');
        v_img_bytes := NULLIF(v_imagen->>'bytes', '')::BIGINT;
        v_img_original_filename := NULLIF(BTRIM(v_imagen->>'original_filename'), '');
        v_img_key := COALESCE(v_img_storage_key, v_img_url);

        IF NOT (v_img_key = ANY(v_imagenes_sync)) THEN
          v_imagenes_sync := array_append(v_imagenes_sync, v_img_key);

          IF NOT EXISTS (
            SELECT 1
            FROM tabla_imagenes_eventos i
            WHERE i.id_evento = v_id_evento
              AND (
                (v_img_storage_key IS NOT NULL AND i.storage_key = v_img_storage_key)
                OR i.url_imagen_evento = v_img_url
              )
          ) THEN
            INSERT INTO tabla_imagenes_eventos (
              url_imagen_evento,
              id_evento,
              storage_provider,
              storage_key,
              mime_type,
              bytes,
              original_filename
            ) VALUES (
              v_img_url,
              v_id_evento,
              v_img_storage_provider,
              v_img_storage_key,
              v_img_mime_type,
              v_img_bytes,
              v_img_original_filename
            );
          END IF;
        END IF;
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'ok', TRUE,
    'id_evento', v_id_evento,
    'id_publico_evento', v_id_publico_evento
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'EVENT_DUPLICATE_RESOURCE',
      'sqlstate', SQLSTATE,
      'error', SQLERRM
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