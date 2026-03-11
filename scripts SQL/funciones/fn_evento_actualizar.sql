CREATE OR REPLACE FUNCTION app_api.fn_evento_actualizar(
  p_id_evento INT,
  p_id_usuario_editor INT,
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
AS $$
DECLARE
  v_exists BOOLEAN;
  v_tel JSONB;
  v_info JSONB;
  v_boleto JSONB;
  v_link JSONB;
  v_imagen JSONB;
  v_info_detalle TEXT := '';
  v_info_obligatorio BOOLEAN := FALSE;
  v_line_no INT := 0;
  v_raw_link TEXT;
  v_evento JSONB;
BEGIN
  PERFORM set_config('app.id_usuario', p_id_usuario_editor::TEXT, TRUE);

  SELECT EXISTS(SELECT 1 FROM tabla_eventos WHERE id_evento = p_id_evento)
  INTO v_exists;

  IF NOT v_exists THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'Event not found');
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

  -- Sync phones
  DELETE FROM tabla_eventos_telefonos WHERE id_evento = p_id_evento;

  IF COALESCE(jsonb_typeof(p_telefonos), 'array') = 'array' THEN
    FOR v_tel IN SELECT value FROM jsonb_array_elements(p_telefonos)
    LOOP
      IF NULLIF(regexp_replace(COALESCE(v_tel->>'telefono', ''), '\\D', '', 'g'), '') IS NOT NULL THEN
        INSERT INTO tabla_eventos_telefonos (
          id_evento,
          telefono,
          es_principal
        ) VALUES (
          p_id_evento,
          regexp_replace(v_tel->>'telefono', '\\D', '', 'g')::NUMERIC,
          COALESCE((v_tel->>'es_principal')::BOOLEAN, FALSE)
        )
        ON CONFLICT (id_evento, telefono)
        DO UPDATE SET es_principal = EXCLUDED.es_principal;
      END IF;
    END LOOP;
  END IF;

  -- Sync info importante (single row model)
  DELETE FROM tabla_evento_informacion_importante WHERE id_evento = p_id_evento;

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
    );
  END IF;

  -- Sync ticket rows
  DELETE FROM tabla_boleteria WHERE id_evento = p_id_evento;
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
          p_id_evento,
          BTRIM(v_boleto->>'nombre_boleto'),
          COALESCE(NULLIF(v_boleto->>'precio_boleto', '')::NUMERIC, 0),
          COALESCE(NULLIF(v_boleto->>'servicio', '')::NUMERIC, 0)
        );
      END IF;
    END LOOP;
  END IF;

  -- Sync links
  DELETE FROM tabla_links WHERE id_evento = p_id_evento;
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
        INSERT INTO tabla_links (id_evento, link)
        VALUES (p_id_evento, BTRIM(v_raw_link));
      END IF;
    END LOOP;
  END IF;

  -- Delete selected images
  IF COALESCE(array_length(p_ids_imagenes_eliminar, 1), 0) > 0 THEN
    DELETE FROM tabla_imagenes_eventos
    WHERE id_evento = p_id_evento
      AND id_imagen_evento = ANY(p_ids_imagenes_eliminar);
  END IF;

  -- Insert new images metadata rows
  IF COALESCE(jsonb_typeof(p_imagenes_nuevas), 'array') = 'array' THEN
    FOR v_imagen IN SELECT value FROM jsonb_array_elements(p_imagenes_nuevas)
    LOOP
      IF char_length(COALESCE(BTRIM(v_imagen->>'url_imagen_evento'), '')) > 0 THEN
        INSERT INTO tabla_imagenes_eventos (
          url_imagen_evento,
          id_evento,
          storage_provider,
          storage_key,
          mime_type,
          bytes,
          original_filename
        ) VALUES (
          v_imagen->>'url_imagen_evento',
          p_id_evento,
          COALESCE(NULLIF(BTRIM(v_imagen->>'storage_provider'), ''), 'legacy_url'),
          NULLIF(BTRIM(v_imagen->>'storage_key'), ''),
          COALESCE(NULLIF(BTRIM(v_imagen->>'mime_type'), ''), 'image/jpeg'),
          NULLIF(v_imagen->>'bytes', '')::BIGINT,
          NULLIF(BTRIM(v_imagen->>'original_filename'), '')
        );
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
END;
$$;