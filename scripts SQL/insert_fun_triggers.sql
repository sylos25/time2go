-- Catalogo formal de codigos de error para sincronizar DB/API/Front.

    CREATE OR REPLACE FUNCTION app_api.fn_error_catalogo()
    RETURNS JSONB
    LANGUAGE SQL
    STABLE
    AS $$
    SELECT jsonb_build_object(
    'version', '1.0.0',
    'codes', jsonb_build_array(
        jsonb_build_object('code', 'DB_ERROR', 'http_status', 500, 'description', 'Error interno no controlado'),

        jsonb_build_object('code', 'AUTH_EMAIL_REQUIRED', 'http_status', 400, 'description', 'Correo obligatorio'),
        jsonb_build_object('code', 'AUTH_PASSWORD_REQUIRED', 'http_status', 400, 'description', 'Contrasena obligatoria'),
        jsonb_build_object('code', 'AUTH_EMAIL_ALREADY_EXISTS', 'http_status', 409, 'description', 'Correo ya registrado'),

        jsonb_build_object('code', 'EVENT_INVALID_PAYLOAD', 'http_status', 400, 'description', 'Payload de evento invalido'),
        jsonb_build_object('code', 'EVENT_ID_REQUIRED', 'http_status', 400, 'description', 'ID de evento obligatorio'),
        jsonb_build_object('code', 'EVENT_NOT_FOUND', 'http_status', 404, 'description', 'Evento no encontrado'),
        jsonb_build_object('code', 'EVENT_DUPLICATE_RESOURCE', 'http_status', 409, 'description', 'Recurso duplicado del evento'),
        jsonb_build_object('code', 'EVENT_INVALID_FIELD_TYPE', 'http_status', 400, 'description', 'Tipo invalido en un campo del evento'),

        jsonb_build_object('code', 'VALORACION_INVALID_SCORE', 'http_status', 400, 'description', 'Valoracion fuera de rango'),
        jsonb_build_object('code', 'VALORACION_ALREADY_EXISTS', 'http_status', 409, 'description', 'Valoracion duplicada por usuario-evento'),
        jsonb_build_object('code', 'VALORACION_NOT_FOUND_OR_FORBIDDEN', 'http_status', 404, 'description', 'Valoracion no encontrada o sin permisos'),
        jsonb_build_object('code', 'VALORACION_INVALID_FIELD_TYPE', 'http_status', 400, 'description', 'Tipo invalido en un campo de valoracion'),

        jsonb_build_object('code', 'AUTH_INVALID_FIELD_TYPE', 'http_status', 400, 'description', 'Tipo invalido en un campo de autenticacion')
    )
    );
    $$;


-- Trigger para actualizar la columna fecha_actualizacion en tablas que la poseen.

    CREATE OR REPLACE FUNCTION fun_actualiza_fecha()
    RETURNS TRIGGER AS $$
    BEGIN

    IF to_jsonb(NEW) - 'fecha_actualizacion' IS DISTINCT FROM to_jsonb(OLD) - 'fecha_actualizacion' THEN
        NEW.fecha_actualizacion := CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trig_update_tabla_paises ON tabla_paises;
    CREATE TRIGGER trig_update_tabla_paises
    BEFORE UPDATE ON tabla_paises
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_departamentos ON tabla_departamentos;
    CREATE TRIGGER trig_update_tabla_departamentos
    BEFORE UPDATE ON tabla_departamentos
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_municipios ON tabla_municipios;
    CREATE TRIGGER trig_update_tabla_municipios
    BEFORE UPDATE ON tabla_municipios
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_tipo_sitios ON tabla_tipo_sitios;
    CREATE TRIGGER trig_update_tabla_tipo_sitios
    BEFORE UPDATE ON tabla_tipo_sitios
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_sitios ON tabla_sitios;
    CREATE TRIGGER trig_update_tabla_sitios
    BEFORE UPDATE ON tabla_sitios
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_sitios_telefonos ON tabla_sitios_telefonos;
    CREATE TRIGGER trig_update_tabla_sitios_telefonos
    BEFORE UPDATE ON tabla_sitios_telefonos
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_tipo_infraestructura_discapacitados ON tabla_tipo_infraestructura_discapacitados;
    CREATE TRIGGER trig_update_tabla_tipo_infraestructura_discapacitados
    BEFORE UPDATE ON tabla_tipo_infraestructura_discapacitados
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_sitios_discapacitados ON tabla_sitios_discapacitados;
    CREATE TRIGGER trig_update_tabla_sitios_discapacitados
    BEFORE UPDATE ON tabla_sitios_discapacitados
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_roles ON tabla_roles;
    CREATE TRIGGER trig_update_tabla_roles
    BEFORE UPDATE ON tabla_roles
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_usuarios ON tabla_usuarios;
    CREATE TRIGGER trig_update_tabla_usuarios
    BEFORE UPDATE ON tabla_usuarios
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_usuarios_credenciales ON tabla_usuarios_credenciales;
    CREATE TRIGGER trig_update_tabla_usuarios_credenciales
    BEFORE UPDATE ON tabla_usuarios_credenciales
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_accesibilidad_menu ON tabla_accesibilidad_menu;
    CREATE TRIGGER trig_update_tabla_accesibilidad_menu
    BEFORE UPDATE ON tabla_accesibilidad_menu
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_accesibilidad_menu_x_rol ON tabla_accesibilidad_menu_x_rol;
    CREATE TRIGGER trig_update_tabla_accesibilidad_menu_x_rol
    BEFORE UPDATE ON tabla_accesibilidad_menu_x_rol
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_baneados ON tabla_baneados;
    CREATE TRIGGER trig_update_tabla_baneados
    BEFORE UPDATE ON tabla_baneados
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_categoria_eventos ON tabla_categoria_eventos;
    CREATE TRIGGER trig_update_tabla_categoria_eventos
    BEFORE UPDATE ON tabla_categoria_eventos
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_tipo_eventos ON tabla_tipo_eventos;
    CREATE TRIGGER trig_update_tabla_tipo_eventos
    BEFORE UPDATE ON tabla_tipo_eventos
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_eventos ON tabla_eventos;
    CREATE TRIGGER trig_update_tabla_eventos
    BEFORE UPDATE ON tabla_eventos
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_eventos_telefonos ON tabla_eventos_telefonos;
    CREATE TRIGGER trig_update_tabla_eventos_telefonos
    BEFORE UPDATE ON tabla_eventos_telefonos
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_evento_informacion_importante ON tabla_evento_informacion_importante;
    CREATE TRIGGER trig_update_tabla_evento_informacion_importante
    BEFORE UPDATE ON tabla_evento_informacion_importante
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_imagenes_eventos ON tabla_imagenes_eventos;
    CREATE TRIGGER trig_update_tabla_imagenes_eventos
    BEFORE UPDATE ON tabla_imagenes_eventos
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_cambio_rol_usuario ON tabla_cambio_rol_usuario;
    CREATE TRIGGER trig_update_tabla_cambio_rol_usuario
    BEFORE UPDATE ON tabla_cambio_rol_usuario
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_valoraciones ON tabla_valoraciones;
    CREATE TRIGGER trig_update_tabla_valoraciones
    BEFORE UPDATE ON tabla_valoraciones
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_reserva_eventos ON tabla_reserva_eventos;
    CREATE TRIGGER trig_update_tabla_reserva_eventos
    BEFORE UPDATE ON tabla_reserva_eventos
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_reserva_asistentes ON tabla_reserva_asistentes;
    CREATE TRIGGER trig_update_tabla_reserva_asistentes
    BEFORE UPDATE ON tabla_reserva_asistentes
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_boleteria ON tabla_boleteria;
    CREATE TRIGGER trig_update_tabla_boleteria
    BEFORE UPDATE ON tabla_boleteria
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

    DROP TRIGGER IF EXISTS trig_update_tabla_links ON tabla_links;
    CREATE TRIGGER trig_update_tabla_links
    BEFORE UPDATE ON tabla_links
    FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();


-- Trigger para crear id_publico en la tabla usuarios.

  CREATE OR REPLACE FUNCTION generar_id_publico()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.id_publico :=
      substring(encode(digest(NEW.id_usuario::text, 'sha256'), 'hex') from 1 for 12);
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;


  CREATE TRIGGER trg_generar_id_publico BEFORE INSERT ON tabla_usuarios
  FOR EACH ROW EXECUTE FUNCTION generar_id_publico();


-- Trigger para crear id_publico_evento en la tabla eventos.

    CREATE OR REPLACE FUNCTION generar_id_publico_evento()
    RETURNS TRIGGER AS $$
    BEGIN
    NEW.id_publico_evento :=
        substring(encode(digest(NEW.id_evento::text, 'sha256'), 'hex') from 1 for 12);
    RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;


    CREATE TRIGGER trg_generar_id_publico_evento BEFORE INSERT ON tabla_eventos
    FOR EACH ROW EXECUTE FUNCTION generar_id_publico_evento();


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


-- función para actualizar un evento existente con manejo de relaciones complejas.

    CREATE OR REPLACE FUNCTION app_api.fn_evento_actualizar(
    p_id_evento             public.tabla_eventos.id_evento%TYPE,
    p_id_usuario_editor     public.tabla_usuarios.id_usuario%TYPE,
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
    SECURITY INVOKER
    AS $$
    DECLARE
    v_info_detalle     public.tabla_evento_informacion_importante.detalle%TYPE;
    v_info_obligatorio public.tabla_evento_informacion_importante.obligatorio%TYPE;
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
    FROM  public.tabla_eventos
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

    -- ── 4. Actualización principal + captura del estado post‑update ──────────
    UPDATE public.tabla_eventos e
    SET
        nombre_evento       = COALESCE(NULLIF(TRIM(p_evento->>'nombre_evento'),       ''), e.nombre_evento),
        pulep_evento        = COALESCE(NULLIF(TRIM(p_evento->>'pulep_evento'),        ''), e.pulep_evento),
        responsable_evento  = COALESCE(NULLIF(TRIM(p_evento->>'responsable_evento'),  ''), e.responsable_evento),
        id_categoria_evento = COALESCE(NULLIF(p_evento->>'id_categoria_evento',       '')::INT,     e.id_categoria_evento),
        id_tipo_evento      = COALESCE(NULLIF(p_evento->>'id_tipo_evento',            '')::INT,     e.id_tipo_evento),
        id_sitio            = COALESCE(NULLIF(p_evento->>'id_sitio',                  '')::INT,     e.id_sitio),
        descripcion         = COALESCE(NULLIF(TRIM(p_evento->>'descripcion'),         ''), e.descripcion),
        fecha_inicio        = COALESCE(NULLIF(p_evento->>'fecha_inicio',              '')::DATE,    e.fecha_inicio),
        fecha_fin           = COALESCE(NULLIF(p_evento->>'fecha_fin',                 '')::DATE,    e.fecha_fin),
        hora_inicio         = COALESCE(NULLIF(p_evento->>'hora_inicio',               '')::TIME,    e.hora_inicio),
        hora_final          = COALESCE(NULLIF(p_evento->>'hora_final',                '')::TIME,    e.hora_final),
        gratis_pago         = COALESCE(NULLIF(p_evento->>'gratis_pago',               '')::BOOLEAN, e.gratis_pago),
        cupo                = COALESCE(NULLIF(p_evento->>'cupo',                      '')::INT,     e.cupo),
        reservar_anticipado = COALESCE(NULLIF(p_evento->>'reservar_anticipado',       '')::BOOLEAN, e.reservar_anticipado),
        estado              = COALESCE(NULLIF(p_evento->>'estado',                    '')::BOOLEAN, e.estado),
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
        'destacado_por',       e.destacado_por_usuario,
        'fecha_destacado',     e.fecha_destacado,
        'fecha_creacion',      e.fecha_creacion,
        'fecha_actualizacion', e.fecha_actualizacion,
        'fecha_desactivacion', e.fecha_desactivacion
    ) INTO v_evento;

    -- ── 5. Teléfonos: upsert + purga de eliminados ────────────────────────────
    IF COALESCE(jsonb_typeof(p_telefonos), 'array') = 'array' THEN
        WITH telefonos_raw AS (
        SELECT DISTINCT
            NULLIF(REGEXP_REPLACE(TRIM(v.value->>'telefono'), '[^0-9]', '', 'g'), '')::NUMERIC(10,0) AS telefono,
            COALESCE((v.value->>'es_principal')::BOOLEAN, FALSE) AS es_principal
        FROM jsonb_array_elements(p_telefonos) AS v(value)
        WHERE TRIM(v.value->>'telefono') IS NOT NULL
        ),
        upsert_tel AS (
        INSERT INTO public.tabla_eventos_telefonos (id_evento, telefono, es_principal)
        SELECT p_id_evento, telefono, es_principal
        FROM telefonos_raw
        ON CONFLICT (id_evento, telefono)
        DO UPDATE SET es_principal = EXCLUDED.es_principal
        )
        DELETE FROM public.tabla_eventos_telefonos et
        WHERE et.id_evento = p_id_evento
        AND NOT EXISTS (
            SELECT 1 FROM telefonos_raw tr WHERE tr.telefono = et.telefono
        );
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
        VALUES (p_id_evento, v_info_detalle, v_info_obligatorio)
        ON CONFLICT (id_evento)
        DO UPDATE SET
            detalle             = EXCLUDED.detalle,
            obligatorio         = EXCLUDED.obligatorio,
            fecha_actualizacion = CURRENT_TIMESTAMP;
        ELSE
        DELETE FROM public.tabla_evento_informacion_importante WHERE id_evento = p_id_evento;
        END IF;
    END IF;

    -- ── 7. Boletería: insert nuevos + purga de eliminados ─────────────────────
    IF COALESCE(jsonb_typeof(p_boleteria), 'array') = 'array' THEN
        WITH boletos_raw AS (
        SELECT DISTINCT ON (LOWER(TRIM(v.value->>'nombre_boleto')))
            TRIM(v.value->>'nombre_boleto') AS nombre_boleto,
            COALESCE(NULLIF(v.value->>'precio_boleto', '')::NUMERIC(9,2), 0) AS precio_boleto,
            COALESCE(NULLIF(v.value->>'servicio', '')::NUMERIC(9,2), 0) AS servicio
        FROM jsonb_array_elements(p_boleteria) AS v(value)
        WHERE LENGTH(TRIM(v.value->>'nombre_boleto')) >= 1
        ORDER BY LOWER(TRIM(v.value->>'nombre_boleto'))
        ),
        insert_bol AS (
        INSERT INTO public.tabla_boleteria (id_evento, nombre_boleto, precio_boleto, servicio)
        SELECT p_id_evento, nombre_boleto, precio_boleto, servicio
        FROM boletos_raw
        WHERE NOT EXISTS (
            SELECT 1 FROM public.tabla_boleteria b
            WHERE b.id_evento = p_id_evento
            AND LOWER(b.nombre_boleto) = LOWER(boletos_raw.nombre_boleto)
            AND b.precio_boleto IS NOT DISTINCT FROM boletos_raw.precio_boleto
            AND COALESCE(b.servicio, 0) = boletos_raw.servicio
        )
        )
        DELETE FROM public.tabla_boleteria b
        WHERE b.id_evento = p_id_evento
        AND NOT EXISTS (
            SELECT 1 FROM boletos_raw br
            WHERE LOWER(br.nombre_boleto) = LOWER(b.nombre_boleto)
            AND br.precio_boleto IS NOT DISTINCT FROM b.precio_boleto
            AND br.servicio = COALESCE(b.servicio, 0)
        );
    END IF;

    -- ── 8. Links: insert nuevos + purga de eliminados ────────────────────────
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
        ),
        insert_lnk AS (
        INSERT INTO public.tabla_links (id_evento, link)
        SELECT p_id_evento, link
        FROM links_raw
        WHERE NOT EXISTS (
            SELECT 1 FROM public.tabla_links l
            WHERE l.id_evento = p_id_evento AND l.link = links_raw.link
        )
        )
        DELETE FROM public.tabla_links l
        WHERE l.id_evento = p_id_evento
        AND NOT EXISTS (SELECT 1 FROM links_raw lr WHERE lr.link = l.link);
    END IF;

    -- ── 9. Imágenes: eliminar las marcadas explícitamente ────────────────────
    IF cardinality(p_ids_imagenes_eliminar) > 0 THEN
        DELETE FROM public.tabla_imagenes_eventos
        WHERE id_evento = p_id_evento
        AND id_imagen_evento = ANY(p_ids_imagenes_eliminar);
    END IF;

    -- ── 10. Imágenes: insertar nuevas sin duplicar (set‑based, sin loop) ──────
    IF COALESCE(jsonb_typeof(p_imagenes_nuevas), 'array') = 'array' THEN
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
        FROM jsonb_array_elements(p_imagenes_nuevas) AS v(value)
        WHERE NULLIF(TRIM(v.value->>'url_imagen_evento'), '') IS NOT NULL
        ORDER BY COALESCE(NULLIF(TRIM(v.value->>'storage_key'), ''), NULLIF(TRIM(v.value->>'url_imagen_evento'), ''))
        )
        INSERT INTO public.tabla_imagenes_eventos (
        url_imagen_evento, id_evento, storage_provider,
        storage_key, mime_type, bytes, original_filename
        )
        SELECT
        url_imagen_evento, p_id_evento, storage_provider,
        storage_key, mime_type, bytes, original_filename
        FROM imagenes_payload ip
        WHERE NOT EXISTS (
        SELECT 1 FROM public.tabla_imagenes_eventos i
        WHERE i.id_evento = p_id_evento
            AND ( (ip.storage_key IS NOT NULL AND i.storage_key = ip.storage_key)
            OR i.url_imagen_evento = ip.url_imagen_evento )
        );
    END IF;

    -- ── 11. Retorno exitoso ───────────────────────────────────────────────────
    RETURN jsonb_build_object('ok', TRUE, 'event', v_evento);

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
        'error',      'Uno de los identificadores referenciados no existe'
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

    -- ── 2. Preparar datos del documento (si existe) ───────────────────────────
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
    -- ── 3. INSERT principal ───────────────────────────────────────────────────
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
        COALESCE((p_evento->>'reservar_anticipado')::BOOLEAN, FALSE),
        COALESCE((p_evento->>'estado')::BOOLEAN, FALSE)
    FROM doc
    RETURNING id_evento, id_publico_evento
    INTO v_id_evento, v_id_publico_evento;

    -- ── 4. Teléfonos: dedup payload + insert ─────────────────────────────────
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

    -- ── 5. Información importante: consolida ítems en fila única ──────────────
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

    -- ── 6. Boletería ──────────────────────────────────────────────────────────
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

    -- ── 7. Links ──────────────────────────────────────────────────────────────
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

    -- ── 8. Imágenes: DISTINCT ON dedup por clave de almacenamiento ────────────
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

    -- ── 9. Retorno exitoso ────────────────────────────────────────────────────
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


-- funcion para listar eventos con filtros.
 
    CREATE OR REPLACE FUNCTION app_api.fn_eventos_listar_json(
    p_id_evento            public.tabla_eventos.id_evento%TYPE DEFAULT NULL,
    p_id_publico_evento    public.tabla_eventos.id_publico_evento%TYPE DEFAULT NULL,
    p_only_mine            BOOLEAN DEFAULT FALSE,
    p_include_all          BOOLEAN DEFAULT FALSE,
    p_id_usuario_solicitante public.tabla_usuarios.id_usuario%TYPE DEFAULT NULL
    )
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY INVOKER
    AS $$
    DECLARE
    v_eventos JSONB;
    v_single  JSONB;
    BEGIN
    -- ── 1. Query principal con CTEs para evitar subconsultas repetitivas ──────
    WITH
    -- Teléfonos del evento: principal y secundario en una sola pasada
    evento_telefonos AS (
        SELECT
        id_evento,
        MAX(telefono) FILTER (WHERE es_principal) AS telefono_principal,
        MIN(telefono) FILTER (WHERE NOT es_principal) AS telefono_secundario
        FROM public.tabla_eventos_telefonos
        GROUP BY id_evento
    ),
    -- Teléfonos del sitio: principal y secundario
    sitio_telefonos AS (
        SELECT
        id_sitio,
        MAX(telefono_sitio) FILTER (WHERE es_principal) AS sitio_telefono_principal,
        MIN(telefono_sitio) FILTER (WHERE NOT es_principal) AS sitio_telefono_secundario
        FROM public.tabla_sitios_telefonos
        GROUP BY id_sitio
    ),
    -- Infraestructura para discapacitados (agrupada por sitio)
    sitio_discapacidad AS (
        SELECT
        sd.id_sitio,
        BOOL_OR(TRUE) AS tiene_acceso_discapacidad,
        jsonb_agg(
            jsonb_build_object(
            'id_sitios_discapacitados', sd.id_sitios_discapacitados,
            'id_infraestructura_discapacitados', sd.id_infraestructura_discapacitados,
            'nombre_infraestructura_discapacitados', tid.nombre_infraestructura_discapacitados,
            'descripcion', sd.descripcion_relacional
            ) ORDER BY sd.id_sitios_discapacitados
        ) AS infraestructura_discapacitados
        FROM public.tabla_sitios_discapacitados sd
        LEFT JOIN public.tabla_tipo_infraestructura_discapacitados tid
        ON sd.id_infraestructura_discapacitados = tid.id_infraestructura_discapacitados
        GROUP BY sd.id_sitio
    ),
    -- Reservas: conteos por evento
    reservas_stats AS (
        SELECT
        r.id_evento,
        COUNT(DISTINCT r.id_reserva_evento)::INT AS reservas_count,
        COUNT(ra.id_reserva_asistente)::INT AS reservas_asistentes
        FROM public.tabla_reserva_eventos r
        LEFT JOIN public.tabla_reserva_asistentes ra ON ra.id_reserva_evento = r.id_reserva_evento
        WHERE r.estado = TRUE
        GROUP BY r.id_evento
    ),
    -- Datos base del evento con todas las relaciones principales
    eventos_base AS (
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
        e.destacado_por_usuario AS destacado_por,
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
        s.latitud AS sitio_latitud,
        s.longitud AS sitio_longitud,
        m.id_municipio,
        m.nombre_municipio,
        ce.nombre AS categoria_nombre,
        te.nombre_tipo_evento AS tipo_nombre,
        et.telefono_principal,
        et.telefono_secundario,
        st.sitio_telefono_principal,
        st.sitio_telefono_secundario,
        COALESCE(rs.reservas_count, 0) AS reservas_count,
        COALESCE(rs.reservas_asistentes, 0) AS reservas_asistentes,
        iinfo.id_evento_info_item,
        iinfo.detalle AS info_importante_detalle,
        iinfo.obligatorio AS info_importante_obligatorio,
        sd.tiene_acceso_discapacidad,
        COALESCE(sd.infraestructura_discapacitados, '[]'::jsonb) AS infraestructura_discapacitados
        FROM public.tabla_eventos e
        LEFT JOIN public.tabla_usuarios u ON e.id_usuario = u.id_usuario
        LEFT JOIN public.tabla_sitios s ON e.id_sitio = s.id_sitio
        LEFT JOIN public.tabla_municipios m ON s.id_municipio = m.id_municipio
        LEFT JOIN public.tabla_categoria_eventos ce ON e.id_categoria_evento = ce.id_categoria_evento
        LEFT JOIN public.tabla_tipo_eventos te ON e.id_tipo_evento = te.id_tipo_evento
        LEFT JOIN public.tabla_evento_informacion_importante iinfo ON e.id_evento = iinfo.id_evento
        LEFT JOIN evento_telefonos et ON e.id_evento = et.id_evento
        LEFT JOIN sitio_telefonos st ON e.id_sitio = st.id_sitio
        LEFT JOIN reservas_stats rs ON e.id_evento = rs.id_evento
        LEFT JOIN sitio_discapacidad sd ON e.id_sitio = sd.id_sitio
        WHERE
        (p_only_mine = TRUE AND e.id_usuario = p_id_usuario_solicitante)
        OR (p_include_all = TRUE)
        OR (p_only_mine = FALSE AND p_include_all = FALSE AND e.estado = TRUE AND COALESCE(e.proceso, FALSE) = FALSE)
        AND (p_id_evento IS NULL OR e.id_evento = p_id_evento)
        AND (p_id_publico_evento IS NULL OR e.id_publico_evento = p_id_publico_evento)
    ),
    -- Agrupar información importante (puede haber una sola por evento, pero se mantiene la estructura)
    eventos_info AS (
        SELECT
        eb.*,
        jsonb_build_object(
            'id_evento_info_item', eb.id_evento_info_item,
            'detalle', eb.info_importante_detalle,
            'obligatorio', eb.info_importante_obligatorio
        ) AS info_importante_json
        FROM eventos_base eb
    ),
    -- Construir el JSON final para cada evento
    eventos_json AS (
        SELECT
        ei.id_evento,
        jsonb_build_object(
            'id_evento', ei.id_evento,
            'id_publico_evento', ei.id_publico_evento,
            'pulep_evento', ei.pulep_evento,
            'nombre_evento', ei.nombre_evento,
            'responsable_evento', ei.responsable_evento,
            'id_usuario', ei.id_usuario,
            'id_categoria_evento', ei.id_categoria_evento,
            'id_tipo_evento', ei.id_tipo_evento,
            'id_sitio', ei.id_sitio,
            'descripcion', ei.descripcion,
            'telefono_1', ei.telefono_principal,
            'telefono_2', ei.telefono_secundario,
            'fecha_inicio', ei.fecha_inicio,
            'fecha_fin', ei.fecha_fin,
            'hora_inicio', ei.hora_inicio,
            'hora_final', ei.hora_final,
            'gratis_pago', ei.gratis_pago,
            'cupo', ei.cupo,
            'reservar_anticipado', ei.reservar_anticipado,
            'estado', ei.estado,
            'motivo_rechazo', ei.motivo_rechazo,
            'rechazo_por', ei.rechazo_por,
            'destacado', ei.destacado,
            'destacado_por', ei.destacado_por,
            'fecha_destacado', ei.fecha_destacado,
            'fecha_creacion', ei.fecha_creacion,
            'fecha_actualizacion', ei.fecha_actualizacion,
            'fecha_desactivacion', ei.fecha_desactivacion,
            'reservas_count', ei.reservas_count,
            'reservas_asistentes', ei.reservas_asistentes,
            'informacion_importante', CASE
            WHEN ei.id_evento_info_item IS NULL THEN NULL
            ELSE ei.info_importante_json
            END,
            'creador', CASE
            WHEN ei.id_usuario IS NULL THEN NULL
            ELSE jsonb_build_object(
                'id_usuario', ei.id_usuario,
                'nombres', ei.creador_nombres,
                'apellidos', ei.creador_apellidos
            )
            END,
            'sitio', CASE
            WHEN ei.id_sitio IS NULL THEN NULL
            ELSE jsonb_build_object(
                'id_sitio', ei.id_sitio,
                'nombre_sitio', ei.nombre_sitio,
                'direccion', ei.sitio_direccion,
                'latitud', ei.sitio_latitud,
                'longitud', ei.sitio_longitud,
                'acceso_discapacidad', COALESCE(ei.tiene_acceso_discapacidad, FALSE),
                'telefono_1', ei.sitio_telefono_principal,
                'telefono_2', ei.sitio_telefono_secundario,
                'infraestructura_discapacitados', ei.infraestructura_discapacitados
            )
            END,
            'municipio', CASE
            WHEN ei.id_municipio IS NULL THEN NULL
            ELSE jsonb_build_object(
                'id_municipio', ei.id_municipio,
                'nombre_municipio', ei.nombre_municipio
            )
            END,
            'categoria', CASE
            WHEN ei.id_categoria_evento IS NULL THEN NULL
            ELSE jsonb_build_object(
                'id_categoria_evento', ei.id_categoria_evento,
                'nombre', ei.categoria_nombre
            )
            END,
            'tipo_evento', CASE
            WHEN ei.id_tipo_evento IS NULL THEN NULL
            ELSE jsonb_build_object(
                'id_tipo_evento', ei.id_tipo_evento,
                'nombre', ei.tipo_nombre
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
            FROM public.tabla_imagenes_eventos i
            WHERE i.id_evento = ei.id_evento
            ), '[]'::jsonb),
            'documentos', CASE
            WHEN ei.url_documento_evento IS NULL AND ei.documento_storage_key IS NULL THEN '[]'::jsonb
            ELSE jsonb_build_array(jsonb_build_object(
                'id_documento_evento', ei.id_evento,
                'url_documento_evento', ei.url_documento_evento,
                'storage_provider', ei.documento_storage_provider,
                'storage_key', ei.documento_storage_key,
                'mime_type', ei.documento_mime_type,
                'bytes', ei.documento_bytes,
                'original_filename', ei.documento_original_filename
            ))
            END,
            'valores', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'id_boleto', b.id_boleto,
                'nombre_boleto', b.nombre_boleto,
                'precio_boleto', b.precio_boleto,
                'servicio', b.servicio
            ) ORDER BY b.id_boleto)
            FROM public.tabla_boleteria b
            WHERE b.id_evento = ei.id_evento
            ), '[]'::jsonb),
            'links', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'id_link', l.id_link,
                'link', l.link
            ) ORDER BY l.id_link)
            FROM public.tabla_links l
            WHERE l.id_evento = ei.id_evento
            ), '[]'::jsonb)
        ) AS event_json
        FROM eventos_info ei
    )
    SELECT COALESCE(jsonb_agg(event_json ORDER BY id_evento DESC), '[]'::jsonb)
    INTO v_eventos
    FROM eventos_json;

    -- ── 2. Retorno: evento único o listado ────────────────────────────────────
    IF p_id_evento IS NOT NULL OR p_id_publico_evento IS NOT NULL THEN
        v_single := v_eventos->0;

        IF v_single IS NULL THEN
        RETURN jsonb_build_object(
            'ok', FALSE,
            'error_code', 'EVENT_NOT_FOUND',
            'sqlstate', 'P0002',
            'error', 'Evento no encontrado'
        );
        END IF;

        RETURN jsonb_build_object('ok', TRUE, 'event', v_single);
    END IF;

    RETURN jsonb_build_object('ok', TRUE, 'eventos', v_eventos);

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


-- función para listar usuarios con paginación y filtros.

    CREATE OR REPLACE FUNCTION public.fn_listar_usuarios_paginado_json(
  p_role     public.tabla_usuarios.id_rol%TYPE DEFAULT NULL,
  p_roles    INT[] DEFAULT NULL,
  p_estado   public.tabla_usuarios.estado_usuario%TYPE DEFAULT NULL,
  p_q        TEXT DEFAULT NULL,
  p_page     INT DEFAULT 1,
  p_page_size INT DEFAULT 25
)
RETURNS JSONB
LANGUAGE SQL
STABLE
SECURITY INVOKER
AS $$
WITH cfg AS (
  SELECT
    GREATEST(COALESCE(p_page, 1), 1)::INT AS page,
    LEAST(GREATEST(COALESCE(p_page_size, 25), 1), 200)::INT AS page_size,
    NULLIF(TRIM(p_q), '') AS q
),
filtered_with_total AS (
  SELECT
    u.id_usuario,
    r.nombre_rol AS id_rol,
    c.id_google,
    u.nombres,
    u.apellidos,
    u.telefono_persona AS telefono,
    c.correo_usuario AS correo,
    c.validacion_correo,
    u.terminos_condiciones,
    u.estado_usuario AS estado,
    COUNT(1) OVER() AS total_count
  FROM public.tabla_usuarios u
  LEFT JOIN public.tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
  LEFT JOIN public.tabla_roles r ON u.id_rol = r.id_rol
  WHERE
    (p_roles IS NOT NULL AND cardinality(p_roles) > 0 AND u.id_rol = ANY(p_roles))
    OR (p_roles IS NULL AND p_role IS NOT NULL AND u.id_rol = p_role)
    OR (p_roles IS NULL AND p_role IS NULL)
    AND (p_estado IS NULL OR u.estado_usuario = p_estado)
    AND ((SELECT q FROM cfg) IS NULL OR (
      COALESCE(u.id_usuario::TEXT, '') ILIKE ('%' || (SELECT q FROM cfg) || '%')
      OR COALESCE(r.nombre_rol, '') ILIKE ('%' || (SELECT q FROM cfg) || '%')
      OR COALESCE(c.id_google, '') ILIKE ('%' || (SELECT q FROM cfg) || '%')
      OR COALESCE(u.nombres, '') ILIKE ('%' || (SELECT q FROM cfg) || '%')
      OR COALESCE(u.apellidos, '') ILIKE ('%' || (SELECT q FROM cfg) || '%')
      OR COALESCE(u.telefono_persona::TEXT, '') ILIKE ('%' || (SELECT q FROM cfg) || '%')
      OR COALESCE(c.correo_usuario, '') ILIKE ('%' || (SELECT q FROM cfg) || '%')
    ))
),
paged AS (
  SELECT
    id_usuario,
    id_rol,
    id_google,
    nombres,
    apellidos,
    telefono,
    correo,
    validacion_correo,
    terminos_condiciones,
    estado
  FROM filtered_with_total
  ORDER BY id_usuario DESC
  LIMIT (SELECT page_size FROM cfg)
  OFFSET ((SELECT page FROM cfg) - 1) * (SELECT page_size FROM cfg)
)
SELECT jsonb_build_object(
  'usuarios', COALESCE((SELECT jsonb_agg(to_jsonb(paged)) FROM paged), '[]'::jsonb),
  'pagination', (
    SELECT jsonb_build_object(
      'page', (SELECT page FROM cfg),
      'pageSize', (SELECT page_size FROM cfg),
      'total', total_count,
      'totalPages', GREATEST(1, CEIL(total_count::NUMERIC / (SELECT page_size FROM cfg))::INT),
      'hasPrev', (SELECT page FROM cfg) > 1,
      'hasNext', (SELECT page FROM cfg) < GREATEST(1, CEIL(total_count::NUMERIC / (SELECT page_size FROM cfg))::INT)
    )
    FROM filtered_with_total
    LIMIT 1
  )
);
$$;


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