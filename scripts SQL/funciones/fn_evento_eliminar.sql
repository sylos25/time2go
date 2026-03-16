-- Funcion para eliminar un evento existente, eliminando también todas sus relaciones.

CREATE OR REPLACE FUNCTION app_api.fn_evento_eliminar(
  p_id_evento tabla_eventos.id_evento%TYPE,
  p_id_usuario_editor tabla_usuarios.id_usuario%TYPE
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public, app_api, pg_temp
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  IF p_id_evento IS NULL THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error_code', 'EVENT_ID_REQUIRED',
      'sqlstate', '22023',
      'error', 'El id_evento es obligatorio'
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