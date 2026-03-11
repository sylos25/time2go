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