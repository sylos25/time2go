-- Funcion para actualizar un evento existente, con sus datos principales y relaciones.

CREATE OR REPLACE FUNCTION app_api.fn_evento_actualizar(
  p_id_evento tabla_eventos.id_evento%TYPE,
  p_id_usuario_editor tabla_usuarios.id_usuario%TYPE,
  p_evento JSONB,
  p_telefonos JSONB DEFAULT '[]'::JSONB,
  p_info_importante JSONB DEFAULT '[]'::JSONB,
  p_boleteria JSONB DEFAULT '[]'::JSONB,
  p_links JSONB DEFAULT '[]'::JSONB,
  p_imagenes_nuevas JSONB DEFAULT '[]'::JSONB,
  p_ids_imagenes_eliminar INT[] DEFAULT '{}'::INT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public, app_api, pg_temp
AS $$
DECLARE
  v_exists BOOLEAN;
  v_tel JSONB;
  v_info JSONB;
  v_boleto JSONB;
  v_link JSONB;
  v_imagen JSONB;
  v_tel_num tabla_eventos_telefonos.telefono%TYPE;
  v_telefonos_sync tabla_eventos_telefonos.telefono%TYPE[] := '{}'::NUMERIC[];
  v_links_sync tabla_links.link%TYPE[] := ARRAY[]::TEXT[];
  v_boleteria_sync TEXT[] := ARRAY[]::TEXT[];
  v_boleto_nombre tabla_boleteria.nombre_boleto%TYPE;
  v_boleto_precio tabla_boleteria.precio_boleto%TYPE;
  v_boleto_servicio tabla_boleteria.servicio%TYPE;
  v_boleto_key TEXT;
  v_info_detalle tabla_evento_informacion_importante.detalle%TYPE := '';
  v_info_obligatorio tabla_evento_informacion_importante.obligatorio%TYPE := FALSE;
  v_line_no INT := 0;
  v_raw_link tabla_links.link%TYPE;
  v_img_url tabla_imagenes_eventos.url_imagen_evento%TYPE;
  v_img_storage_key tabla_imagenes_eventos.storage_key%TYPE;
  v_img_mime_type tabla_imagenes_eventos.mime_type%TYPE;
  v_img_bytes tabla_imagenes_eventos.bytes%TYPE;
  v_img_original_filename tabla_imagenes_eventos.original_filename%TYPE;
  v_img_storage_provider tabla_imagenes_eventos.storage_provider%TYPE;
  v_imagenes_sync TEXT[] := ARRAY[]::TEXT[];
  v_img_key TEXT;
  v_evento JSONB;
BEGIN
  IF p_evento IS NULL OR COALESCE(jsonb_typeof(p_evento), '') <> 'object' THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'EVENT_INVALID_PAYLOAD',
      'sqlstate', '22023',
      'error', 'El payload del evento debe ser un objeto JSON'
    );
  END IF;

  PERFORM set_config('app.id_usuario', p_id_usuario_editor::TEXT, TRUE);

  SELECT TRUE
  INTO v_exists
  FROM tabla_eventos
  WHERE id_evento = p_id_evento
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'EVENT_NOT_FOUND',
      'sqlstate', 'P0002',
      'error', 'Event not found'
    );
  END IF;

  UPDATE tabla_eventos e
  SET
    nombre_evento = COALESCE(NULLIF(BTRIM(p_evento->>'nombre_evento'), ''), e.nombre_evento),
    pulep_evento = CASE
      WHEN p_evento ? 'pulep_evento' THEN NULLIF(BTRIM(p_evento->>'pulep_evento'), '')
      ELSE e.pulep_evento
    END,
    responsable_evento = COALESCE(NULLIF(BTRIM(p_evento->>'responsable_evento'), ''), e.responsable_evento),
    id_categoria_evento = COALESCE(NULLIF(p_evento->>'id_categoria_evento', '')::INT, e.id_categoria_evento),
    id_tipo_evento = COALESCE(NULLIF(p_evento->>'id_tipo_evento', '')::INT, e.id_tipo_evento),
    id_sitio = COALESCE(NULLIF(p_evento->>'id_sitio', '')::INT, e.id_sitio),
    descripcion = COALESCE(NULLIF(BTRIM(p_evento->>'descripcion'), ''), e.descripcion),
    fecha_inicio = COALESCE(NULLIF(p_evento->>'fecha_inicio', '')::DATE, e.fecha_inicio),
    fecha_fin = COALESCE(NULLIF(p_evento->>'fecha_fin', '')::DATE, e.fecha_fin),
    hora_inicio = COALESCE(NULLIF(p_evento->>'hora_inicio', '')::TIME, e.hora_inicio),
    hora_final = COALESCE(NULLIF(p_evento->>'hora_final', '')::TIME, e.hora_final),
    gratis_pago = COALESCE(NULLIF(p_evento->>'gratis_pago', '')::BOOLEAN, e.gratis_pago),
    cupo = COALESCE(NULLIF(p_evento->>'cupo', '')::INT, e.cupo),
    reservar_anticipado = COALESCE(NULLIF(p_evento->>'reservar_anticipado', '')::BOOLEAN, e.reservar_anticipado),
    estado = COALESCE(NULLIF(p_evento->>'estado', '')::BOOLEAN, e.estado),
    fecha_actualizacion = CURRENT_TIMESTAMP
  WHERE e.id_evento = p_id_evento;

  -- Sync phones (upsert + delete only removed values)
  IF COALESCE(jsonb_typeof(p_telefonos), 'array') = 'array' THEN
    FOR v_tel IN SELECT value FROM jsonb_array_elements(p_telefonos)
    LOOP
      v_tel_num := NULLIF(regexp_replace(COALESCE(v_tel->>'telefono', ''), '\\D', '', 'g'), '')::NUMERIC;

      IF v_tel_num IS NOT NULL THEN
        INSERT INTO tabla_eventos_telefonos (
          id_evento,
          telefono,
          es_principal
        ) VALUES (
          p_id_evento,
          v_tel_num,
          COALESCE((v_tel->>'es_principal')::BOOLEAN, FALSE)
        )
        ON CONFLICT (id_evento, telefono)
        DO UPDATE SET es_principal = EXCLUDED.es_principal;

        IF NOT (v_tel_num = ANY(v_telefonos_sync)) THEN
          v_telefonos_sync := array_append(v_telefonos_sync, v_tel_num);
        END IF;
      END IF;
    END LOOP;

    DELETE FROM tabla_eventos_telefonos
    WHERE id_evento = p_id_evento
      AND NOT (telefono = ANY(v_telefonos_sync));
  END IF;

  -- Sync info importante (single row model)
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
      p_id_evento,
      v_info_detalle,
      v_info_obligatorio
    )
    ON CONFLICT (id_evento)
    DO UPDATE SET
      detalle = EXCLUDED.detalle,
      obligatorio = EXCLUDED.obligatorio,
      fecha_actualizacion = CURRENT_TIMESTAMP;
  ELSE
    DELETE FROM tabla_evento_informacion_importante WHERE id_evento = p_id_evento;
  END IF;

  -- Sync ticket rows (set-based: keep existing, insert new, delete removed)
  IF COALESCE(jsonb_typeof(p_boleteria), 'array') = 'array' THEN
    FOR v_boleto IN SELECT value FROM jsonb_array_elements(p_boleteria)
    LOOP
      IF char_length(COALESCE(BTRIM(v_boleto->>'nombre_boleto'), '')) >= 1 THEN
        v_boleto_nombre := BTRIM(v_boleto->>'nombre_boleto');
        v_boleto_precio := COALESCE(NULLIF(v_boleto->>'precio_boleto', '')::NUMERIC, 0);
        v_boleto_servicio := COALESCE(NULLIF(v_boleto->>'servicio', '')::NUMERIC, 0);
        v_boleto_key := lower(v_boleto_nombre)
          || '|' || COALESCE(v_boleto_precio, 0)::TEXT
          || '|' || COALESCE(v_boleto_servicio, 0)::TEXT;

        IF NOT (v_boleto_key = ANY(v_boleteria_sync)) THEN
          v_boleteria_sync := array_append(v_boleteria_sync, v_boleto_key);
        END IF;

        IF NOT EXISTS (
          SELECT 1
          FROM tabla_boleteria b
          WHERE b.id_evento = p_id_evento
            AND lower(b.nombre_boleto) = lower(v_boleto_nombre)
            AND b.precio_boleto = v_boleto_precio
            AND COALESCE(b.servicio, 0) = COALESCE(v_boleto_servicio, 0)
        ) THEN
          INSERT INTO tabla_boleteria (
            id_evento,
            nombre_boleto,
            precio_boleto,
            servicio
          ) VALUES (
            p_id_evento,
            v_boleto_nombre,
            v_boleto_precio,
            v_boleto_servicio
          );
        END IF;
      END IF;
    END LOOP;

    DELETE FROM tabla_boleteria
    WHERE id_evento = p_id_evento
      AND NOT (
        lower(nombre_boleto)
        || '|' || COALESCE(precio_boleto, 0)::TEXT
        || '|' || COALESCE(servicio, 0)::TEXT
      = ANY(v_boleteria_sync));
  END IF;

  -- Sync links (set-based: keep existing, insert new, delete removed)
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
          WHERE id_evento = p_id_evento
            AND link = v_raw_link
        ) THEN
          INSERT INTO tabla_links (id_evento, link)
          VALUES (p_id_evento, v_raw_link);
        END IF;
      END IF;
    END LOOP;

    DELETE FROM tabla_links
    WHERE id_evento = p_id_evento
      AND NOT (link = ANY(v_links_sync));
  END IF;

  -- Delete selected images
  IF COALESCE(array_length(p_ids_imagenes_eliminar, 1), 0) > 0 THEN
    DELETE FROM tabla_imagenes_eventos
    WHERE id_evento = p_id_evento
      AND id_imagen_evento = ANY(p_ids_imagenes_eliminar);
  END IF;

  -- Sync images (dedupe payload + dedupe against current event)
  IF COALESCE(jsonb_typeof(p_imagenes_nuevas), 'array') = 'array' THEN
    FOR v_imagen IN SELECT value FROM jsonb_array_elements(p_imagenes_nuevas)
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
            WHERE i.id_evento = p_id_evento
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
              p_id_evento,
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

  SELECT to_jsonb(x)
  INTO v_evento
  FROM (
    SELECT
      e.id_evento,
      e.id_publico_evento,
      e.pulep_evento,
      e.nombre_evento,
      e.responsable_evento,
      e.id_usuario,
      e.id_categoria_evento,
      e.id_tipo_evento,
      e.id_sitio,
      e.descripcion,
      e.fecha_inicio,
      e.fecha_fin,
      e.hora_inicio,
      e.hora_final,
      e.gratis_pago,
      e.cupo,
      e.reservar_anticipado,
      e.estado,
      e.motivo_rechazo,
      e.rechazo_por,
      e.destacado,
      e.destacado_por,
      e.fecha_destacado,
      e.fecha_creacion,
      e.fecha_actualizacion,
      e.fecha_desactivacion
    FROM tabla_eventos e
    WHERE e.id_evento = p_id_evento
  ) x;

  RETURN jsonb_build_object(
    'ok', TRUE,
    'event', v_evento
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