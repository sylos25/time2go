-- Phase 1 executable SQL functions
-- Scope:
-- 1) app_api.fn_auth_crear_usuario
-- 2) app_api.fn_evento_crear
-- 3) app_api.fn_evento_actualizar
-- 4) app_api.fn_evento_eliminar

CREATE SCHEMA IF NOT EXISTS app_api;

-- ---------------------------------------------------------------------
-- 1) Create user (tabla_usuarios + tabla_personas + tabla_usuarios_credenciales)
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- 2) Create event aggregate
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_api.fn_evento_crear(
  p_id_usuario INT,
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
AS $$
DECLARE
  v_id_evento INT;
  v_id_publico_evento TEXT;
  v_tel JSONB;
  v_info JSONB;
  v_boleto JSONB;
  v_link JSONB;
  v_imagen JSONB;
  v_info_detalle TEXT := '';
  v_info_obligatorio BOOLEAN := FALSE;
  v_line_no INT := 0;
  v_raw_link TEXT;
BEGIN
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
        INSERT INTO tabla_links (id_evento, link)
        VALUES (v_id_evento, BTRIM(v_raw_link));
      END IF;
    END LOOP;
  END IF;

  -- Images metadata rows
  IF COALESCE(jsonb_typeof(p_imagenes), 'array') = 'array' THEN
    FOR v_imagen IN SELECT value FROM jsonb_array_elements(p_imagenes)
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
          v_id_evento,
          COALESCE(NULLIF(BTRIM(v_imagen->>'storage_provider'), ''), 'legacy_url'),
          NULLIF(BTRIM(v_imagen->>'storage_key'), ''),
          COALESCE(NULLIF(BTRIM(v_imagen->>'mime_type'), ''), 'image/jpeg'),
          NULLIF(v_imagen->>'bytes', '')::BIGINT,
          NULLIF(BTRIM(v_imagen->>'original_filename'), '')
        );
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'ok', TRUE,
    'id_evento', v_id_evento,
    'id_publico_evento', v_id_publico_evento
  );
END;
$$;

-- ---------------------------------------------------------------------
-- 3) Update event aggregate
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- 4) Delete event aggregate
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_api.fn_evento_eliminar(
  p_id_evento INT,
  p_id_usuario_editor INT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  PERFORM set_config('app.id_usuario', p_id_usuario_editor::TEXT, TRUE);

  SELECT EXISTS(SELECT 1 FROM tabla_eventos WHERE id_evento = p_id_evento)
  INTO v_exists;

  IF NOT v_exists THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'Event not found');
  END IF;

  DELETE FROM tabla_reserva_asistentes
  WHERE id_reserva_evento IN (
    SELECT id_reserva_evento
    FROM tabla_reserva_eventos
    WHERE id_evento = p_id_evento
  );

  DELETE FROM tabla_reserva_eventos WHERE id_evento = p_id_evento;
  DELETE FROM tabla_valoraciones WHERE id_evento = p_id_evento;
  DELETE FROM tabla_links WHERE id_evento = p_id_evento;
  DELETE FROM tabla_boleteria WHERE id_evento = p_id_evento;
  DELETE FROM tabla_imagenes_eventos WHERE id_evento = p_id_evento;
  DELETE FROM tabla_evento_informacion_importante WHERE id_evento = p_id_evento;
  DELETE FROM tabla_eventos_telefonos WHERE id_evento = p_id_evento;
  DELETE FROM tabla_favoritos WHERE id_evento = p_id_evento;
  DELETE FROM tabla_eventos WHERE id_evento = p_id_evento;

  RETURN jsonb_build_object('ok', TRUE, 'id_evento', p_id_evento);
END;
$$;

-- ---------------------------------------------------------------------
-- 5) List events as JSON (single source of truth in PostgreSQL)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_api.fn_eventos_listar_json(
  p_id_evento INT DEFAULT NULL,
  p_id_publico_evento TEXT DEFAULT NULL,
  p_only_mine BOOLEAN DEFAULT FALSE,
  p_include_all BOOLEAN DEFAULT FALSE,
  p_id_usuario_solicitante INT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_eventos JSONB;
  v_single JSONB;
BEGIN
  WITH eventos_base AS (
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
      e.url_documento_evento,
      e.documento_storage_provider,
      e.documento_storage_key,
      e.documento_mime_type,
      e.documento_bytes,
      e.documento_original_filename,
      e.fecha_creacion,
      e.fecha_actualizacion,
      e.fecha_desactivacion,
      u.nombres AS creador_nombres,
      u.apellidos AS creador_apellidos,
      s.nombre_sitio,
      s.direccion AS sitio_direccion,
      m.id_municipio,
      m.nombre_municipio,
      ce.id_categoria_evento AS evento_categoria_id,
      ce.nombre AS categoria_nombre,
      te.id_tipo_evento AS evento_tipo_id,
      te.nombre AS tipo_nombre,
      tel_evento_principal.telefono AS telefono_1,
      tel_evento_secundario.telefono AS telefono_2,
      tel_sitio_principal.telefono AS sitio_telefono_1,
      tel_sitio_secundario.telefono AS sitio_telefono_2,
      COALESCE(rv.reservas_count, 0) AS reservas_count,
      COALESCE(rv.reservas_asistentes, 0) AS reservas_asistentes,
      iinfo.id_evento_info_item,
      iinfo.detalle AS info_importante_detalle,
      iinfo.obligatorio AS info_importante_obligatorio
    FROM tabla_eventos e
    LEFT JOIN tabla_usuarios u ON e.id_usuario = u.id_usuario
    LEFT JOIN tabla_sitios s ON e.id_sitio = s.id_sitio
    LEFT JOIN tabla_municipios m ON s.id_municipio = m.id_municipio
    LEFT JOIN tabla_categoria_eventos ce ON e.id_categoria_evento = ce.id_categoria_evento
    LEFT JOIN tabla_tipo_eventos te ON e.id_tipo_evento = te.id_tipo_evento
    LEFT JOIN tabla_evento_informacion_importante iinfo ON e.id_evento = iinfo.id_evento
    LEFT JOIN LATERAL (
      SELECT telefono
      FROM tabla_eventos_telefonos
      WHERE id_evento = e.id_evento AND es_principal = TRUE
      ORDER BY fecha_creacion ASC
      LIMIT 1
    ) tel_evento_principal ON TRUE
    LEFT JOIN LATERAL (
      SELECT telefono
      FROM tabla_eventos_telefonos
      WHERE id_evento = e.id_evento AND es_principal = FALSE
      ORDER BY fecha_creacion ASC
      LIMIT 1
    ) tel_evento_secundario ON TRUE
    LEFT JOIN LATERAL (
      SELECT telefono
      FROM tabla_sitios_telefonos
      WHERE id_sitio = s.id_sitio AND es_principal = TRUE
      ORDER BY fecha_creacion ASC
      LIMIT 1
    ) tel_sitio_principal ON TRUE
    LEFT JOIN LATERAL (
      SELECT telefono
      FROM tabla_sitios_telefonos
      WHERE id_sitio = s.id_sitio AND es_principal = FALSE
      ORDER BY fecha_creacion ASC
      LIMIT 1
    ) tel_sitio_secundario ON TRUE
    LEFT JOIN (
      SELECT
        id_evento,
        COUNT(1)::INT AS reservas_count,
        COALESCE(SUM(cuantos_asistiran), 0)::INT AS reservas_asistentes
      FROM tabla_reserva_eventos
      WHERE estado = TRUE
      GROUP BY id_evento
    ) rv ON e.id_evento = rv.id_evento
    WHERE
      (
        CASE
          WHEN p_only_mine = TRUE THEN e.id_usuario = p_id_usuario_solicitante
          WHEN p_include_all = TRUE THEN TRUE
          ELSE e.estado = TRUE
        END
      )
      AND (p_id_evento IS NULL OR e.id_evento = p_id_evento)
      AND (p_id_publico_evento IS NULL OR e.id_publico_evento = p_id_publico_evento)
  ), eventos_json AS (
    SELECT
      eb.id_evento,
      jsonb_build_object(
        'id_evento', eb.id_evento,
        'id_publico_evento', eb.id_publico_evento,
        'pulep_evento', eb.pulep_evento,
        'nombre_evento', eb.nombre_evento,
        'responsable_evento', eb.responsable_evento,
        'id_usuario', eb.id_usuario,
        'id_categoria_evento', eb.id_categoria_evento,
        'id_tipo_evento', eb.id_tipo_evento,
        'id_sitio', eb.id_sitio,
        'descripcion', eb.descripcion,
        'telefono_1', eb.telefono_1,
        'telefono_2', eb.telefono_2,
        'fecha_inicio', eb.fecha_inicio,
        'fecha_fin', eb.fecha_fin,
        'hora_inicio', eb.hora_inicio,
        'hora_final', eb.hora_final,
        'gratis_pago', eb.gratis_pago,
        'cupo', eb.cupo,
        'reservar_anticipado', eb.reservar_anticipado,
        'estado', eb.estado,
        'motivo_rechazo', eb.motivo_rechazo,
        'rechazo_por', eb.rechazo_por,
        'destacado', eb.destacado,
        'destacado_por', eb.destacado_por,
        'fecha_destacado', eb.fecha_destacado,
        'fecha_creacion', eb.fecha_creacion,
        'fecha_actualizacion', eb.fecha_actualizacion,
        'fecha_desactivacion', eb.fecha_desactivacion,
        'reservas_count', eb.reservas_count,
        'reservas_asistentes', eb.reservas_asistentes,
        'informacion_importante', CASE
          WHEN eb.id_evento_info_item IS NULL THEN NULL
          ELSE jsonb_build_object(
            'id_evento_info_item', eb.id_evento_info_item,
            'detalle', eb.info_importante_detalle,
            'obligatorio', eb.info_importante_obligatorio
          )
        END,
        'creador', CASE
          WHEN eb.id_usuario IS NULL THEN NULL
          ELSE jsonb_build_object(
            'id_usuario', eb.id_usuario,
            'nombres', eb.creador_nombres,
            'apellidos', eb.creador_apellidos
          )
        END,
        'sitio', CASE
          WHEN eb.id_sitio IS NULL THEN NULL
          ELSE jsonb_build_object(
            'id_sitio', eb.id_sitio,
            'nombre_sitio', eb.nombre_sitio,
            'direccion', eb.sitio_direccion,
            'acceso_discapacidad', EXISTS (
              SELECT 1
              FROM tabla_sitios_discapacitados sdx
              WHERE sdx.id_sitio = eb.id_sitio
            ),
            'telefono_1', eb.sitio_telefono_1,
            'telefono_2', eb.sitio_telefono_2,
            'infraestructura_discapacitados', COALESCE((
              SELECT jsonb_agg(jsonb_build_object(
                'id_sitios_discapacitados', sd.id_sitios_discapacitados,
                'id_infraestructura_discapacitados', sd.id_infraestructura_discapacitados,
                'nombre_infraestructura_discapacitados', tid.nombre_infraestructura_discapacitados,
                'descripcion', sd.descripcion
              ) ORDER BY sd.id_sitios_discapacitados)
              FROM tabla_sitios_discapacitados sd
              LEFT JOIN tabla_tipo_infraestructura_discapacitados tid
                ON sd.id_infraestructura_discapacitados = tid.id_infraestructura_discapacitados
              WHERE sd.id_sitio = eb.id_sitio
            ), '[]'::jsonb)
          )
        END,
        'municipio', CASE
          WHEN eb.id_municipio IS NULL THEN NULL
          ELSE jsonb_build_object(
            'id_municipio', eb.id_municipio,
            'nombre_municipio', eb.nombre_municipio
          )
        END,
        'categoria', CASE
          WHEN eb.evento_categoria_id IS NULL THEN NULL
          ELSE jsonb_build_object(
            'id_categoria_evento', eb.evento_categoria_id,
            'nombre', eb.categoria_nombre
          )
        END,
        'tipo_evento', CASE
          WHEN eb.evento_tipo_id IS NULL THEN NULL
          ELSE jsonb_build_object(
            'id_tipo_evento', eb.evento_tipo_id,
            'nombre', eb.tipo_nombre
          )
        END,
        'imagenes', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id_imagen_evento', i.id_imagen_evento,
            'url_imagen_evento', i.url_imagen_evento,
            'storage_provider', i.storage_provider,
            'storage_key', i.storage_key,
            'mime_type', i.mime_type,
            'bytes', i.bytes,
            'original_filename', i.original_filename
          ) ORDER BY i.id_imagen_evento)
          FROM tabla_imagenes_eventos i
          WHERE i.id_evento = eb.id_evento
        ), '[]'::jsonb),
        'documentos', COALESCE((
          SELECT CASE
            WHEN eb.url_documento_evento IS NULL AND eb.documento_storage_key IS NULL THEN '[]'::jsonb
            ELSE jsonb_build_array(jsonb_build_object(
              'id_documento_evento', eb.id_evento,
              'url_documento_evento', eb.url_documento_evento,
              'storage_provider', eb.documento_storage_provider,
              'storage_key', eb.documento_storage_key,
              'mime_type', eb.documento_mime_type,
              'bytes', eb.documento_bytes,
              'original_filename', eb.documento_original_filename
            ))
          END
        ), '[]'::jsonb),
        'valores', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id_boleto', b.id_boleto,
            'nombre_boleto', b.nombre_boleto,
            'precio_boleto', b.precio_boleto,
            'servicio', b.servicio
          ) ORDER BY b.id_boleto)
          FROM tabla_boleteria b
          WHERE b.id_evento = eb.id_evento
        ), '[]'::jsonb),
        'links', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id_link', l.id_link,
            'link', l.link
          ) ORDER BY l.id_link)
          FROM tabla_links l
          WHERE l.id_evento = eb.id_evento
        ), '[]'::jsonb)
      ) AS event_json
    FROM eventos_base eb
  )
  SELECT COALESCE(jsonb_agg(event_json ORDER BY id_evento DESC), '[]'::jsonb)
  INTO v_eventos
  FROM eventos_json;

  IF p_id_evento IS NOT NULL OR p_id_publico_evento IS NOT NULL THEN
    SELECT value INTO v_single FROM jsonb_array_elements(v_eventos) LIMIT 1;

    IF v_single IS NULL THEN
      RETURN jsonb_build_object('ok', FALSE, 'error', 'Evento no encontrado');
    END IF;

    RETURN jsonb_build_object('ok', TRUE, 'event', v_single);
  END IF;

  RETURN jsonb_build_object('ok', TRUE, 'eventos', v_eventos);
END;
$$;
