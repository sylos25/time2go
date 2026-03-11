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
      p.nombres AS creador_nombres,
      p.apellidos AS creador_apellidos,
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
    LEFT JOIN tabla_personas p ON e.id_usuario = p.id_usuario
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
        r.id_evento,
        COUNT(DISTINCT r.id_reserva_evento)::INT AS reservas_count,
        COALESCE(COUNT(ra.id_reserva_asistente), 0)::INT AS reservas_asistentes
      FROM tabla_reserva_eventos r
      LEFT JOIN tabla_reserva_asistentes ra ON ra.id_reserva_evento = r.id_reserva_evento
      WHERE r.estado = TRUE
      GROUP BY r.id_evento
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
