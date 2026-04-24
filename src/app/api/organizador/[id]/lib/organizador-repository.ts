import type { PoolClient } from "pg"

import type {
  OrganizadorEventoRow,
  OrganizadorRow,
} from "@/app/api/organizador/[id]/lib/organizador-types"

export async function findOrganizadorById(client: PoolClient, organizadorId: number) {
  const result = await client.query<OrganizadorRow>(
    `SELECT
       u.id_usuario,
       u.nombres,
       u.apellidos,
       (
         SELECT et.telefono
         FROM tabla_eventos_telefonos et
         INNER JOIN tabla_eventos e ON e.id_evento = et.id_evento
         WHERE e.id_usuario = u.id_usuario AND et.es_principal = TRUE
         ORDER BY et.fecha_creacion DESC
         LIMIT 1
       ) AS telefono_1,
       (
         SELECT et.telefono
         FROM tabla_eventos_telefonos et
         INNER JOIN tabla_eventos e ON e.id_evento = et.id_evento
         WHERE e.id_usuario = u.id_usuario AND et.es_principal = FALSE
         ORDER BY et.fecha_creacion DESC
         LIMIT 1
       ) AS telefono_2
     FROM tabla_usuarios u
     WHERE u.id_usuario = $1
       AND u.id_rol = 4
       AND u.estado = TRUE
     LIMIT 1`,
    [organizadorId]
  )

  return result.rows?.[0] ?? null
}

export async function listOrganizadorEventos(client: PoolClient, organizadorId: number) {
  const result = await client.query<OrganizadorEventoRow>(
    `SELECT
       e.id_evento,
       e.id_publico_evento,
       e.nombre_evento,
       e.descripcion,
       e.fecha_inicio,
       e.fecha_fin,
       e.hora_inicio,
       e.hora_final,
       e.gratis_pago,
       e.cupo,
       e.reservar_anticipado,
       json_build_object(
         'id_categoria_evento', ce.id_categoria_evento,
         'nombre', ce.nombre
       ) AS categoria,
       json_build_object(
         'id_tipo_evento', te.id_tipo_evento,
         'nombre', te.nombre_tipo_evento
       ) AS tipo_evento,
       json_build_object(
         'id_sitio',       s.id_sitio,
         'nombre_sitio',   s.nombre_sitio,
         'direccion',      s.direccion,
         'latitud',        s.latitud,
         'longitud',       s.longitud
       ) AS sitio,
       json_build_object(
         'id_municipio',       m.id_municipio,
         'nombre_municipio',   m.nombre_municipio
       ) AS municipio,
       (
         SELECT json_build_object('url_imagen_evento', img.url_imagen_evento)
         FROM tabla_eventos_imagenes img
         WHERE img.id_evento = e.id_evento
         ORDER BY img.id_imagen_evento ASC
         LIMIT 1
       ) AS imagen_portada
     FROM tabla_eventos e
     LEFT JOIN tabla_categoria_eventos  ce ON e.id_categoria_evento = ce.id_categoria_evento
     LEFT JOIN tabla_tipo_eventos       te ON e.id_tipo_evento      = te.id_tipo_evento
     LEFT JOIN tabla_sitios              s ON e.id_sitio             = s.id_sitio
     LEFT JOIN tabla_municipios          m ON s.id_municipio         = m.id_municipio
     WHERE e.id_usuario = $1
       AND e.estado = TRUE
     ORDER BY e.fecha_inicio DESC NULLS LAST`,
    [organizadorId]
  )

  return result.rows || []
}
