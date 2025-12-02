import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import streamifier from "streamifier";
import pool from "@/lib/db";

export const runtime = "nodejs";

// POST: crear evento con imágenes
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("additionalImages") as File[];

    // Subir imágenes a Cloudinary y obtener URLs
    const urls: string[] = [];
    for (const f of files) {
      const buffer = Buffer.from(await f.arrayBuffer());
      const url = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "eventos" },
          (err, result) => (err ? reject(err) : resolve(result!.secure_url))
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });
      urls.push(url);
    }

    // Extraer campos del formulario
    const id_evento = formData.get("id_evento") as string;
    const nombre_evento = formData.get("nombre_evento") as string;
    const id_usuario = formData.get("id_usuario") as string;
    const id_tipo_evento = formData.get("id_tipo_evento") as string;
    const id_municipio = formData.get("id_municipio") as string;
    const id_sitio = formData.get("id_sitio") as string;
    const descripcion = formData.get("descripcion") as string;
    const telefono_1 = formData.get("telefono_1") as string;
    const telefono_2 = formData.get("telefono_2") as string;
    const fecha_inicio = formData.get("fecha_inicio") as string;
    const fecha_fin = formData.get("fecha_fin") as string;
    const hora_inicio = formData.get("hora_inicio") as string;
    const hora_final = formData.get("hora_final") as string;

    // 1. Insertar evento en tabla_eventos
    const eventResult = await pool.query(
      `INSERT INTO tabla_eventos (
        id_evento, nombre_evento, id_usuario, id_tipo_evento, id_municipio, id_sitio,
        descripcion, telefono_1, telefono_2, fecha_inicio, fecha_fin,
        hora_inicio, hora_final, id_imagen
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING id_evento`,
      [
        id_evento,
        nombre_evento,
        id_usuario,
        id_tipo_evento,
        id_municipio,
        id_sitio,
        descripcion,
        telefono_1,
        telefono_2,
        fecha_inicio,
        fecha_fin,
        hora_inicio,
        hora_final,
        null, // id_imagen lo dejamos null porque se manejará en tabla_imagenes_eventos
      ]
    );

    const newEventId = eventResult.rows[0].id_evento;

    // 2. Insertar imágenes en tabla_imagenes_eventos
    for (const url of urls) {
      await pool.query(
        `INSERT INTO tabla_imagenes_eventos (url_imagen_evento, id_evento)
         VALUES ($1, $2)`,
        [url, newEventId]
      );
    }

    return NextResponse.json({
      ok: true,
      eventId: newEventId,
      urls,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, message: "Error creando evento con imágenes" },
      { status: 500 }
    );
  }
}

// GET: listar eventos con sus imágenes
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT e.id_evento,
             e.nombre_evento,
             e.descripcion,
             e.fecha_inicio,
             e.fecha_fin,
             i.id_imagen_evento,
             i.url_imagen_evento
      FROM tabla_eventos e
      LEFT JOIN tabla_imagenes_eventos i
        ON e.id_evento = i.id_evento
      ORDER BY e.id_evento DESC;
    `);

    // Agrupar imágenes por evento
    const eventosMap: Record<string, any> = {};
    result.rows.forEach((row) => {
      if (!eventosMap[row.id_evento]) {
        eventosMap[row.id_evento] = {
          id_evento: row.id_evento,
          nombre_evento: row.nombre_evento,
          descripcion: row.descripcion,
          fecha_inicio: row.fecha_inicio,
          fecha_fin: row.fecha_fin,
          imagenes: [],
        };
      }
      if (row.url_imagen_evento) {
        eventosMap[row.id_evento].imagenes.push({
          id_imagen_evento: row.id_imagen_evento,
          url_imagen_evento: row.url_imagen_evento,
        });
      }
    });

    const eventos = Object.values(eventosMap);
    return NextResponse.json({ ok: true, eventos });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, message: "Error obteniendo eventos" },
      { status: 500 }
    );
  }
}
