CREATE OR REPLACE FUNCTION fn_listar_usuarios_paginado_json(
  p_role INT DEFAULT NULL,
  p_roles INT[] DEFAULT NULL,
  p_estado BOOLEAN DEFAULT NULL,
  p_q TEXT DEFAULT NULL,
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 25
)
RETURNS JSONB
LANGUAGE SQL
STABLE
AS $$
WITH cfg AS (
  SELECT
    GREATEST(COALESCE(p_page, 1), 1)::INT AS page,
    LEAST(GREATEST(COALESCE(p_page_size, 25), 1), 200)::INT AS page_size,
    NULLIF(BTRIM(COALESCE(p_q, '')), '') AS q
),
filtered AS (
  SELECT
    u.id_usuario,
    r.nombre_rol AS id_rol,
    c.id_google,
    p.nombres,
    p.apellidos,
    p.telefono,
    c.correo,
    c.validacion_correo,
    u.terminos_condiciones,
    u.estado
  FROM tabla_usuarios u
  LEFT JOIN tabla_personas p ON p.id_usuario = u.id_usuario
  LEFT JOIN tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
  LEFT JOIN tabla_roles r ON u.id_rol = r.id_rol
  WHERE
    u.id_rol IN (1, 2)
    AND (
      CASE
        WHEN p_roles IS NOT NULL AND cardinality(p_roles) > 0 THEN u.id_rol = ANY(p_roles)
        WHEN p_role IS NOT NULL THEN u.id_rol = p_role
        ELSE TRUE
      END
    )
    AND (p_estado IS NULL OR u.estado = p_estado)
    AND (
      (SELECT q FROM cfg) IS NULL
      OR CAST(u.id_usuario AS TEXT) ILIKE ('%' || (SELECT q FROM cfg) || '%')
      OR COALESCE(r.nombre_rol, '') ILIKE ('%' || (SELECT q FROM cfg) || '%')
      OR COALESCE(c.id_google, '') ILIKE ('%' || (SELECT q FROM cfg) || '%')
      OR COALESCE(p.nombres, '') ILIKE ('%' || (SELECT q FROM cfg) || '%')
      OR COALESCE(p.apellidos, '') ILIKE ('%' || (SELECT q FROM cfg) || '%')
      OR COALESCE(CAST(p.telefono AS TEXT), '') ILIKE ('%' || (SELECT q FROM cfg) || '%')
      OR COALESCE(c.correo, '') ILIKE ('%' || (SELECT q FROM cfg) || '%')
    )
),
total_cte AS (
  SELECT COUNT(id_usuario)::INT AS total
  FROM filtered
),
paged AS (
  SELECT *
  FROM filtered
  ORDER BY id_usuario DESC
  LIMIT (SELECT page_size FROM cfg)
  OFFSET ((SELECT page FROM cfg) - 1) * (SELECT page_size FROM cfg)
),
meta AS (
  SELECT
    (SELECT page FROM cfg) AS page,
    (SELECT page_size FROM cfg) AS page_size,
    total,
    GREATEST(1, CEIL(total::NUMERIC / NULLIF((SELECT page_size FROM cfg), 0))::INT) AS total_pages
  FROM total_cte
)
SELECT jsonb_build_object(
  'usuarios', COALESCE((SELECT jsonb_agg(to_jsonb(paged)) FROM paged), '[]'::jsonb),
  'pagination', (
    SELECT jsonb_build_object(
      'page', page,
      'pageSize', page_size,
      'total', total,
      'totalPages', total_pages,
      'hasPrev', page > 1,
      'hasNext', page < total_pages
    )
    FROM meta
  )
);
$$;
