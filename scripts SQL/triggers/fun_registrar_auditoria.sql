-- Trigger para registrar las auditorias (INSERT, UPDATE, DELETE).

CREATE OR REPLACE FUNCTION fun_registrar_auditoria()
RETURNS TRIGGER AS $$
DECLARE
    v_id_usuario_text TEXT;
    v_id_usuario_app INT;
    v_id_auditoria BIGINT;
    v_valor_anterior TEXT;
    v_valor_nuevo TEXT;
    v_pk RECORD;
    v_col RECORD;
BEGIN
    v_id_usuario_text := current_setting('app.id_usuario', true);

    IF v_id_usuario_text IS NOT NULL AND v_id_usuario_text ~ '^[0-9]+$' THEN
        v_id_usuario_app := v_id_usuario_text::INT;
    ELSE
        v_id_usuario_app := NULL;
    END IF;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO tabla_auditoria_bd (tabla, operacion, id_usuario_app, usuario_bd)
        VALUES (TG_TABLE_NAME, TG_OP, v_id_usuario_app, CURRENT_USER)
        RETURNING id_auditoria INTO v_id_auditoria;

        FOR v_pk IN
            SELECT a.attname AS columna_pk
            FROM pg_index i
            JOIN pg_attribute a
              ON a.attrelid = i.indrelid
             AND a.attnum = ANY(i.indkey)
            WHERE i.indrelid = TG_RELID
              AND i.indisprimary
            ORDER BY a.attnum
        LOOP
            EXECUTE format('SELECT ($1).%I::text', v_pk.columna_pk)
            INTO v_valor_nuevo
            USING NEW;

            INSERT INTO tabla_auditoria_pk (id_auditoria, columna_pk, valor_pk)
            VALUES (v_id_auditoria, v_pk.columna_pk, COALESCE(v_valor_nuevo, 'NULL'));
        END LOOP;

        FOR v_col IN
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = TG_TABLE_SCHEMA
              AND table_name = TG_TABLE_NAME
            ORDER BY ordinal_position
        LOOP
            EXECUTE format('SELECT ($1).%I::text', v_col.column_name)
            INTO v_valor_nuevo
            USING NEW;

            INSERT INTO tabla_auditoria_detalle (id_auditoria, columna, valor_nuevo)
            VALUES (v_id_auditoria, v_col.column_name, v_valor_nuevo);
        END LOOP;

        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO tabla_auditoria_bd (tabla, operacion, id_usuario_app, usuario_bd)
        VALUES (TG_TABLE_NAME, TG_OP, v_id_usuario_app, CURRENT_USER)
        RETURNING id_auditoria INTO v_id_auditoria;

        FOR v_pk IN
            SELECT a.attname AS columna_pk
            FROM pg_index i
            JOIN pg_attribute a
              ON a.attrelid = i.indrelid
             AND a.attnum = ANY(i.indkey)
            WHERE i.indrelid = TG_RELID
              AND i.indisprimary
            ORDER BY a.attnum
        LOOP
            EXECUTE format('SELECT ($1).%I::text', v_pk.columna_pk)
            INTO v_valor_nuevo
            USING NEW;

            INSERT INTO tabla_auditoria_pk (id_auditoria, columna_pk, valor_pk)
            VALUES (v_id_auditoria, v_pk.columna_pk, COALESCE(v_valor_nuevo, 'NULL'));
        END LOOP;

        FOR v_col IN
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = TG_TABLE_SCHEMA
              AND table_name = TG_TABLE_NAME
            ORDER BY ordinal_position
        LOOP
            EXECUTE format('SELECT ($1).%I::text', v_col.column_name)
            INTO v_valor_anterior
            USING OLD;

            EXECUTE format('SELECT ($1).%I::text', v_col.column_name)
            INTO v_valor_nuevo
            USING NEW;

            IF v_valor_anterior IS DISTINCT FROM v_valor_nuevo THEN
                INSERT INTO tabla_auditoria_detalle (id_auditoria, columna, valor_anterior, valor_nuevo)
                VALUES (v_id_auditoria, v_col.column_name, v_valor_anterior, v_valor_nuevo);
            END IF;
        END LOOP;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO tabla_auditoria_bd (tabla, operacion, id_usuario_app, usuario_bd)
        VALUES (TG_TABLE_NAME, TG_OP, v_id_usuario_app, CURRENT_USER)
        RETURNING id_auditoria INTO v_id_auditoria;

        FOR v_pk IN
            SELECT a.attname AS columna_pk
            FROM pg_index i
            JOIN pg_attribute a
              ON a.attrelid = i.indrelid
             AND a.attnum = ANY(i.indkey)
            WHERE i.indrelid = TG_RELID
              AND i.indisprimary
            ORDER BY a.attnum
        LOOP
            EXECUTE format('SELECT ($1).%I::text', v_pk.columna_pk)
            INTO v_valor_anterior
            USING OLD;

            INSERT INTO tabla_auditoria_pk (id_auditoria, columna_pk, valor_pk)
            VALUES (v_id_auditoria, v_pk.columna_pk, COALESCE(v_valor_anterior, 'NULL'));
        END LOOP;

        FOR v_col IN
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = TG_TABLE_SCHEMA
              AND table_name = TG_TABLE_NAME
            ORDER BY ordinal_position
        LOOP
            EXECUTE format('SELECT ($1).%I::text', v_col.column_name)
            INTO v_valor_anterior
            USING OLD;

            INSERT INTO tabla_auditoria_detalle (id_auditoria, columna, valor_anterior)
            VALUES (v_id_auditoria, v_col.column_name, v_valor_anterior);
        END LOOP;

        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    reg RECORD;
BEGIN
    FOR reg IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename LIKE 'tabla_%'
                                        AND tablename NOT IN ('tabla_auditoria_bd', 'tabla_auditoria_pk', 'tabla_auditoria_detalle')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_auditoria ON %I', reg.tablename);
        EXECUTE format('CREATE TRIGGER trg_auditoria AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION fun_registrar_auditoria()', reg.tablename);
    END LOOP;
END;
$$;