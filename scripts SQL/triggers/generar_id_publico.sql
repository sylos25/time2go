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