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
