-- Función para listar usuarios con paginación y filtros, devolviendo resultados en formato JSON.
-- ─────────────────────────────────────────────────────────────────────────────
-- fn_listar_usuarios_paginado_json
-- Retorna una lista paginada de usuarios con roles, credenciales y estado.
-- Parámetros:
--   p_role      - Filtro por un rol específico (id_rol).
--   p_roles     - Filtro por múltiples roles (array de ids).
--   p_estado    - Filtro por estado_usuario (TRUE/FALSE).
--   p_q         - Texto de búsqueda en múltiples campos (id, rol, google, nombres, apellidos, teléfono, correo).
--   p_page      - Número de página (por defecto 1).
--   p_page_size - Tamaño de página (por defecto 25, máximo 200).
-- Respuesta: { usuarios: [...], pagination: { page, pageSize, total, totalPages, hasPrev, hasNext } }
-- ─────────────────────────────────────────────────────────────────────────────

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
    COUNT(1) OVER() AS total_count   -- Buenas prácticas: COUNT(1) en lugar de COUNT(*)
  FROM public.tabla_usuarios u
  LEFT JOIN public.tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
  LEFT JOIN public.tabla_roles r ON u.id_rol = r.id_rol
  WHERE
    (p_roles IS NOT NULL AND cardinality(p_roles) > 0 AND u.id_rol = ANY(p_roles))
    OR (p_roles IS NULL AND p_role IS NOT NULL AND u.id_rol = p_role)
    OR (p_roles IS NULL AND p_role IS NULL)
    AND (p_estado IS NULL OR u.estado_usuario = p_estado)
    AND (cfg.q IS NULL OR (
      COALESCE(u.id_usuario::TEXT, '') ILIKE ('%' || cfg.q || '%')
      OR COALESCE(r.nombre_rol, '') ILIKE ('%' || cfg.q || '%')
      OR COALESCE(c.id_google, '') ILIKE ('%' || cfg.q || '%')
      OR COALESCE(u.nombres, '') ILIKE ('%' || cfg.q || '%')
      OR COALESCE(u.apellidos, '') ILIKE ('%' || cfg.q || '%')
      OR COALESCE(u.telefono_persona::TEXT, '') ILIKE ('%' || cfg.q || '%')
      OR COALESCE(c.correo_usuario, '') ILIKE ('%' || cfg.q || '%')
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