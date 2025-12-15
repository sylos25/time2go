import { NextResponse } from "next/server";
import { cloudinary, uploadBuffer } from "@/lib/cloudinary";
import pool from "@/lib/db";

export const runtime = "nodejs";

// POST: crear evento con imágenes
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("additionalImages") as File[];

    // Subir imágenes a Cloudinary y obtener URLs (usando helper uploadBuffer)
    const urls: string[] = [];
    for (const f of files) {
      const buffer = Buffer.from(await f.arrayBuffer());
      const result = await uploadBuffer(buffer, "eventos");
      urls.push(result.secure_url);
    }

    // Extraer campos del formulario (mapeo y parseo de tipos)
    const nombre_evento = (formData.get("nombre_evento") as string) || "";
    const descripcion = (formData.get("descripcion") as string) || "";
    const fecha_inicio = (formData.get("fecha_inicio") as string) || null;
    const fecha_fin = (formData.get("fecha_fin") as string) || null;
    const hora_inicio = (formData.get("hora_inicio") as string) || null;
    const hora_final = (formData.get("hora_final") as string) || null;
    const dias_semana = (formData.get("dias_semana") as string) || null; // JSON string
    const id_usuario = Number(formData.get("id_usuario") || 0);
    const id_categoria_evento = Number(formData.get("id_categoria_evento") || 0);
    const id_tipo_evento = Number(formData.get("id_tipo_evento") || 0);
    const id_municipio = Number(formData.get("id_municipio") || 0);
    const id_sitio = Number(formData.get("id_sitio") || 0);
    const telefono_1 = (formData.get("telefono_1") as string) || null;
    const telefono_2 = (formData.get("telefono_2") as string) || null;
    const costo = parseFloat((formData.get("costo") as string) || "0") || 0;
    const cupo = parseInt((formData.get("cupo") as string) || "0") || 0;
    const estado = String(formData.get("estado") || "true") === "true";

    // 1. Insertar evento en tabla_eventos (omitimos id_evento para que sea autoincrement)
    const eventResult = await pool.query(
      `INSERT INTO tabla_eventos (
        nombre_evento, descripcion, fecha_inicio, fecha_fin, hora_inicio, hora_final, dias_semana,
        id_usuario, id_categoria_evento, id_tipo_evento, id_municipio, id_sitio,
        telefono_1, telefono_2, costo, cupo, estado
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING id_evento`,
      [
        nombre_evento,
        descripcion,
        fecha_inicio,
        fecha_fin,
        hora_inicio,
        hora_final,
        dias_semana,
        id_usuario,
        id_categoria_evento,
        id_tipo_evento,
        id_municipio,
        id_sitio,
        telefono_1,
        telefono_2,
        costo,
        cupo,
        estado,
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

    // 3. Si se envió un documento (PDF u otro), subirlo y guardarlo también
    const docFile = formData.get("documento") as File | null;
    let documentoUrl: string | null = null;
    if (docFile && (docFile as unknown as any).size) {
      const bufferDoc = Buffer.from(await docFile.arrayBuffer());
      // subimos como recurso raw (pdf, docx, etc.)
      const docResult = await uploadBuffer(bufferDoc, "eventos/documents", { resource_type: "raw" });
      documentoUrl = docResult.secure_url;
      // Guardar link del documento en la misma tabla de archivos vinculados al evento
      await pool.query(
        `INSERT INTO tabla_imagenes_eventos (url_imagen_evento, id_evento)
         VALUES ($1, $2)`,
        [documentoUrl, newEventId]
      );
    }

    return NextResponse.json({
      ok: true,
      eventId: newEventId,
      urls,
      documento: documentoUrl,
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
             e.dias_semana,
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
          dias_semana: row.dias_semana,
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
