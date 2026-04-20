-- ─────────────────────────────────────────────────────────────────────────────
-- fn_eventos_listar_json
-- Lista eventos con todas sus relaciones en una sola consulta set-based.
-- Soporta filtro por id, id_publico, propios, todos o solo activos.
-- Respuesta: { ok: true, event: {...} }   — con filtro de id único
--            { ok: true, eventos: [...] } — listado
--            { ok: false, error_code, sqlstate, error }
-- ─────────────────────────────────────────────────────────────────────────────

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