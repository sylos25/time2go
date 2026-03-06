-- Trigger para crear id_publico_evento en la tabla eventos.

CREATE OR REPLACE FUNCTION generar_id_publico_evento()
RETURNS TRIGGER AS $$
BEGIN
  NEW.id_publico_evento :=
    substring(encode(digest(NEW.id_evento::text, 'sha256'), 'hex') from 1 for 12);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_generar_id_publico BEFORE INSERT ON tabla_eventos
FOR EACH ROW EXECUTE FUNCTION generar_id_publico_evento();