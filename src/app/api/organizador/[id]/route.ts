import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const organizadorId = Number(id);

    if (!organizadorId || isNaN(organizadorId)) {
        return NextResponse.json(
            { ok: false, message: "ID de organizador inválido" },
            { status: 400 }
        );
    }

    const client = await pool.connect();
    try {
        // ── 1. Datos del organizador ─────────────────────────────────
        const orgRes = await client.query(
            `SELECT
         u.id_usuario,
         u.nombres,
         u.apellidos,
         -- Teléfonos del organizador (tomados de la tabla de teléfonos de eventos,
         -- usando el teléfono más reciente como referencia)
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
         AND u.id_rol = 4        -- solo organizadores
         AND u.estado = TRUE
       LIMIT 1`,
            [organizadorId]
        );

        if (!orgRes.rows || orgRes.rows.length === 0) {
            return NextResponse.json(
                { ok: false, message: "Organizador no encontrado" },
                { status: 404 }
            );
        }

        const organizador = orgRes.rows[0];

        // ── 2. Eventos publicados por este organizador ───────────────
        const evRes = await client.query(
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
         -- Categoría
         json_build_object(
           'id_categoria_evento', ce.id_categoria_evento,
           'nombre', ce.nombre
         ) AS categoria,
         -- Tipo
         json_build_object(
           'id_tipo_evento', te.id_tipo_evento,
           'nombre', te.nombre_tipo_evento
         ) AS tipo_evento,
         -- Sitio
         json_build_object(
           'id_sitio',       s.id_sitio,
           'nombre_sitio',   s.nombre_sitio,
           'direccion',      s.direccion,
           'latitud',        s.latitud,
           'longitud',       s.longitud
         ) AS sitio,
         -- Municipio
         json_build_object(
           'id_municipio',       m.id_municipio,
           'nombre_municipio',   m.nombre_municipio
         ) AS municipio,
         -- Primera imagen del evento
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
        );

        // Normalizar: convertir imagen_portada en array para que el front
        // pueda usar ev.imagenes?.[0]?.url_imagen_evento sin cambios
        const eventos = (evRes.rows || []).map((ev) => ({
            ...ev,
            imagenes: ev.imagen_portada ? [ev.imagen_portada] : [],
        }));

        return NextResponse.json({
            ok: true,
            organizador,
            eventos,
        });
    } catch (err) {
        console.error("Error en /api/organizador/[id]:", err);
        return NextResponse.json(
            { ok: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}