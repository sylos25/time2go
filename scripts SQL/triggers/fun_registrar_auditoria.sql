CREATE OR REPLACE FUNCTION fun_registrar_auditoria()
RETURNS TRIGGER AS $$
DECLARE
    v_id_usuario_app INT;
    v_id_auditoria   BIGINT;
    v_pk_columns     TEXT[];
    v_all_columns    TEXT[];
    v_col_name       TEXT;
    v_valor_anterior TEXT;
    v_valor_nuevo    TEXT;
BEGIN
    -- 1. Obtener ID del usuario desde la configuración (manejo seguro de errores)
    BEGIN
        v_id_usuario_app := current_setting('app.id_usuario', true)::INT;
    EXCEPTION WHEN OTHERS THEN
        v_id_usuario_app := NULL;
    END;

    -- 2. Insertar cabecera del evento (única para cualquier operación)
    INSERT INTO tabla_auditoria_bd (nombre_tabla, operacion, id_usuario, usuario_bd)
    VALUES (TG_TABLE_NAME, TG_OP, v_id_usuario_app, CURRENT_USER)
    RETURNING id_auditoria INTO v_id_auditoria;

    -- 3. Obtener columnas de clave primaria (una sola vez)
    SELECT ARRAY(
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = TG_RELID AND i.indisprimary
        ORDER BY a.attnum
    ) INTO v_pk_columns;

    -- 4. Obtener todas las columnas de la tabla (una sola vez)
    SELECT ARRAY(
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = TG_TABLE_SCHEMA AND table_name = TG_TABLE_NAME
        ORDER BY ordinal_position
    ) INTO v_all_columns;

    -- 5. Registrar las claves primarias (según operación)
    FOREACH v_col_name IN ARRAY v_pk_columns
    LOOP
        IF TG_OP IN ('INSERT', 'UPDATE') THEN
            EXECUTE format('SELECT ($1).%I::text', v_col_name) INTO v_valor_nuevo USING NEW;
            INSERT INTO tabla_auditoria_pk (id_auditoria, columna_pk, valor_pk)
            VALUES (v_id_auditoria, v_col_name, v_valor_nuevo);
        ELSIF TG_OP = 'DELETE' THEN
            EXECUTE format('SELECT ($1).%I::text', v_col_name) INTO v_valor_anterior USING OLD;
            INSERT INTO tabla_auditoria_pk (id_auditoria, columna_pk, valor_pk)
            VALUES (v_id_auditoria, v_col_name, v_valor_anterior);
        END IF;
    END LOOP;

    -- 6. Registrar el detalle de cada columna (según operación)
    FOREACH v_col_name IN ARRAY v_all_columns
    LOOP
        IF TG_OP = 'INSERT' THEN
            EXECUTE format('SELECT ($1).%I::text', v_col_name) INTO v_valor_nuevo USING NEW;
            INSERT INTO tabla_auditoria_detalle (id_auditoria, columna, valor_nuevo)
            VALUES (v_id_auditoria, v_col_name, v_valor_nuevo);
        ELSIF TG_OP = 'UPDATE' THEN
            EXECUTE format('SELECT ($1).%I::text', v_col_name) INTO v_valor_anterior USING OLD;
            EXECUTE format('SELECT ($1).%I::text', v_col_name) INTO v_valor_nuevo USING NEW;
            IF v_valor_anterior IS DISTINCT FROM v_valor_nuevo THEN
                INSERT INTO tabla_auditoria_detalle (id_auditoria, columna, valor_anterior, valor_nuevo)
                VALUES (v_id_auditoria, v_col_name, v_valor_anterior, v_valor_nuevo);
            END IF;
        ELSIF TG_OP = 'DELETE' THEN
            EXECUTE format('SELECT ($1).%I::text', v_col_name) INTO v_valor_anterior USING OLD;
            INSERT INTO tabla_auditoria_detalle (id_auditoria, columna, valor_anterior)
            VALUES (v_id_auditoria, v_col_name, v_valor_anterior);
        END IF;
    END LOOP;

    -- 7. Retornar el registro correspondiente (requerido por el trigger)
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;