import { NextResponse } from "next/server";
import { cloudinary, uploadBuffer } from "@/lib/cloudinary";
import pool from "@/lib/db";

export const runtime = "nodejs";


export async function POST(req: Request) {
  const client = await pool.connect();
  try {
    const formData = await req.formData();


    const files = formData.getAll("additionalImages") as File[];
    const imageUrls: string[] = [];
    for (const f of files) {
      const buffer = Buffer.from(await f.arrayBuffer());
      const result = await uploadBuffer(buffer, "eventos");
      imageUrls.push(result.secure_url);
    }


    const docFile = formData.get("documento") as File | null;
    let documentoUrl: string | null = null;
    if (docFile && (docFile as unknown as any).size) {
      const bufferDoc = Buffer.from(await docFile.arrayBuffer());
      const docResult = await uploadBuffer(bufferDoc, "eventos/documents", { resource_type: "raw" });
      documentoUrl = docResult.secure_url;
    }


    const nombre_evento = (formData.get("nombre_evento") as string) || "";
    const descripcion = (formData.get("descripcion") as string) || "";
    const fecha_inicio = (formData.get("fecha_inicio") as string) || null;
    const fecha_fin = (formData.get("fecha_fin") as string) || null;
    const hora_inicio = (formData.get("hora_inicio") as string) || null;
    const hora_final = (formData.get("hora_final") as string) || null;
    const dias_semana = (formData.get("dias_semana") as string) || null; // JSON string array

    let numero_documento = String(formData.get("numero_documento") || "");
    const authHeader = (req.headers.get('authorization') || '').trim();
    if (authHeader.startsWith('Bearer ')) {
      try {
        const { verifyToken } = await import('@/lib/jwt');
        const t = authHeader.slice(7).trim();
        const payload = verifyToken(t);
        if (payload && payload.numero_documento) numero_documento = String(payload.numero_documento);
      } catch (e) {
        console.error('token verification in events POST failed', e);
      }
    }

    const id_categoria_evento = Number(formData.get("id_categoria_evento") || 0);
    const id_tipo_evento = Number(formData.get("id_tipo_evento") || 0);
    const id_municipio = Number(formData.get("id_municipio") || 0);
    const id_sitio = Number(formData.get("id_sitio") || 0);
    const telefono_1 = (formData.get("telefono_1") as string) || null;
    const telefono_2 = (formData.get("telefono_2") as string) || null;
    const cupo = parseInt((formData.get("cupo") as string) || "0") || 0;
    const estado = String(formData.get("estado") || "true") === "true";

    const gratis_pago = String(formData.get("gratis_pago") || "false") === "true"; // TRUE => PAGO


    const costosRaw = formData.get("costos") as string | null;
    const tiposRaw = formData.get("tiposBoleteria") as string | null;
    const linksRaw = formData.get("linksBoleteria") as string | null;
    const costos: string[] = costosRaw ? JSON.parse(costosRaw) : [];
    const tiposBoleteria: string[] = tiposRaw ? JSON.parse(tiposRaw) : [];
    const linksBoleteria: string[] = linksRaw ? JSON.parse(linksRaw) : [];


    await client.query('BEGIN');


    const nextIdRes = await client.query(`SELECT COALESCE(MAX(id_evento),0)+1 AS next FROM tabla_eventos`);
    const nextEventId = nextIdRes && nextIdRes.rows && nextIdRes.rows[0] ? nextIdRes.rows[0].next : 1;


    await client.query(
      `INSERT INTO tabla_eventos (
        id_evento, nombre_evento, id_usuario, id_categoria_evento, id_tipo_evento, id_sitio, id_municipio,
        descripcion, telefono_1, telefono_2, fecha_inicio, fecha_fin, hora_inicio, hora_final,
        dias_semana, gratis_pago, cupo, estado
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [
        nextEventId,
        nombre_evento,
        numero_documento,
        id_categoria_evento,
        id_tipo_evento,
        id_sitio,
        id_municipio,
        descripcion,
        telefono_1,
        telefono_2,
        fecha_inicio,
        fecha_fin,
        hora_inicio,
        hora_final,
        dias_semana,
        gratis_pago,
        cupo,
        estado,
      ]
    );

    const newEventId = nextEventId;


    for (const url of imageUrls) {
      await client.query(
        `INSERT INTO tabla_imagenes_eventos (url_imagen_evento, id_evento) VALUES ($1,$2)`,
        [url, newEventId]
      );
    }


    if (documentoUrl) {
      await client.query(
        `INSERT INTO tabla_documentos_eventos (url_documento_evento, id_evento) VALUES ($1,$2)`,
        [documentoUrl, newEventId]
      );
    }

    for (const link of linksBoleteria.filter(Boolean)) {
      await client.query(`INSERT INTO tabla_links (id_evento, link) VALUES ($1,$2)`, [newEventId, link]);
    }


    if (dias_semana) {
      try {
        const diasArr: string[] = JSON.parse(dias_semana);
        for (const d of diasArr) {
          await client.query(`INSERT INTO tabla_eventos_x_dias (id_evento, dia) VALUES ($1,$2)`, [newEventId, d]);
        }
      } catch (e) {
        console.warn('invalid dias_semana format', e);
      }
    }


    if (gratis_pago) {
      for (let i = 0; i < tiposBoleteria.length; i++) {
        const nombreCat = tiposBoleteria[i];
        const costoRaw = costos[i] || '';

        const valor = parseFloat(costoRaw.replace(/[^0-9.,-]/g, '').replace(',', '.')) || 0;


        let catRes = await client.query(`SELECT id_categoria_boleto FROM tabla_categoria_boletos WHERE nombre_categoria_boleto = $1`, [nombreCat]);
        let id_categoria_boleto: number;
        if (catRes && catRes.rows && catRes.rows.length > 0) {
          id_categoria_boleto = catRes.rows[0].id_categoria_boleto;
        } else {
          const nextRes = await client.query(`SELECT COALESCE(MAX(id_categoria_boleto),0)+1 AS next FROM tabla_categoria_boletos`);
          const nextId = (nextRes.rows && nextRes.rows[0] && nextRes.rows[0].next) ? nextRes.rows[0].next : 1;
          await client.query(`INSERT INTO tabla_categoria_boletos (id_categoria_boleto, nombre_categoria_boleto) VALUES ($1,$2)`, [nextId, nombreCat]);
          id_categoria_boleto = nextId;
        }


        await client.query(`INSERT INTO tabla_valores (id_evento, id_categoria_boleto, valor) VALUES ($1,$2,$3)`, [newEventId, id_categoria_boleto, valor]);
      }
    }

    await client.query('COMMIT');

    return NextResponse.json({ ok: true, eventId: newEventId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return NextResponse.json({ ok: false, message: 'Error creando evento' }, { status: 500 });
  } finally {
    client.release();
  }
}


export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const idParam = url.searchParams.get('id');

    const result = await pool.query(`
      SELECT e.id_evento,
             e.nombre_evento,
             e.descripcion,
             e.fecha_inicio,
             e.fecha_fin,
             e.dias_semana,
             e.gratis_pago,
             e.cupo,
             e.estado,
             e.fecha_creacion AS fecha_creacion_evento,
             e.id_usuario AS creador_num_doc,
             u.nombres AS creador_nombres,
             u.apellidos AS creador_apellidos,
             e.telefono_1 AS event_telefono_1,
             e.telefono_2 AS event_telefono_2,
             s.id_sitio,
             s.nombre_sitio,
             s.direccion AS sitio_direccion,
             s.telefono_1 AS sitio_telefono_1,
             s.telefono_2 AS sitio_telefono_2,
             m.id_municipio,
             m.nombre_municipio,
             ce.id_categoria_evento AS evento_categoria_id,
             ce.nombre AS categoria_nombre,
             te.id_tipo_evento AS evento_tipo_id,
             te.nombre AS tipo_nombre,
             i.id_imagen_evento,
             i.url_imagen_evento,
             d.id_documento_evento,
             d.url_documento_evento,
             v.id_valor,
             v.valor,
             cb.id_categoria_boleto,
             cb.nombre_categoria_boleto,
             l.id_link,
             l.link,
             vr.id_valoracion AS id_valoracion,
             vr.id_usuario AS valoracion_usuario,
             vr.valoracion AS valoracion_valor,
             vr.comentario AS valoracion_comentario,
             vr.fecha_creacion AS valoracion_fecha
      FROM tabla_eventos e
      LEFT JOIN tabla_usuarios u ON e.id_usuario = u.numero_documento
      LEFT JOIN tabla_sitios s ON e.id_sitio = s.id_sitio
      LEFT JOIN tabla_municipios m ON e.id_municipio = m.id_municipio
      LEFT JOIN tabla_categoria_eventos ce ON e.id_categoria_evento = ce.id_categoria_evento
      LEFT JOIN tabla_tipo_eventos te ON e.id_tipo_evento = te.id_tipo_evento
      LEFT JOIN tabla_imagenes_eventos i ON e.id_evento = i.id_evento
      LEFT JOIN tabla_documentos_eventos d ON e.id_evento = d.id_evento
      LEFT JOIN tabla_valores v ON e.id_evento = v.id_evento
      LEFT JOIN tabla_categoria_boletos cb ON v.id_categoria_boleto = cb.id_categoria_boleto
      LEFT JOIN tabla_links l ON e.id_evento = l.id_evento
      LEFT JOIN tabla_valoraciones vr ON e.id_evento = vr.id_evento
      ${idParam ? 'WHERE e.id_evento = $1' : ''}
      ORDER BY e.id_evento DESC;
    `, idParam ? [Number(idParam)] : []);

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
          gratis_pago: row.gratis_pago,
          cupo: row.cupo,
          estado: row.estado,
          fecha_creacion_evento: row.fecha_creacion_evento,
          creador_num_doc: row.creador_num_doc,
          creador_nombres: row.creador_nombres,
          creador_apellidos: row.creador_apellidos,
          event_telefono_1: row.event_telefono_1,
          event_telefono_2: row.event_telefono_2,
          id_sitio: row.id_sitio,
          nombre_sitio: row.nombre_sitio,
          sitio_direccion: row.sitio_direccion,
          sitio_telefono_1: row.sitio_telefono_1,
          sitio_telefono_2: row.sitio_telefono_2,
          id_municipio: row.id_municipio,
          nombre_municipio: row.nombre_municipio,
          categoria_nombre: row.categoria_nombre,
          tipo_nombre: row.tipo_nombre,
          imagenes: [],
          documentos: [],
          valores: [],
          links: [],
        };
      }

      if (row.url_imagen_evento) {
        eventosMap[row.id_evento].imagenes.push({
          id_imagen_evento: row.id_imagen_evento,
          url_imagen_evento: row.url_imagen_evento,
        });
      }

      if (row.url_documento_evento) {
        if (!eventosMap[row.id_evento].documentos.some((d: any) => d.url_documento_evento === row.url_documento_evento)) {
          eventosMap[row.id_evento].documentos.push({
            id_documento_evento: row.id_documento_evento,
            url_documento_evento: row.url_documento_evento,
          });
        }
      }

      if (row.id_valor) {
        eventosMap[row.id_evento].valores.push({
          id_valor: row.id_valor,
          valor: row.valor,
          id_categoria_boleto: row.id_categoria_boleto,
          nombre_categoria_boleto: row.nombre_categoria_boleto,
        });
      }

      if (row.link) {
        if (!eventosMap[row.id_evento].links.some((ln: any) => ln.link === row.link)) {
          eventosMap[row.id_evento].links.push({ id_link: row.id_link, link: row.link });
        }
      }
    });

    const eventos = Object.values(eventosMap);

    const mapped = eventos.map((ev: any) => ({
      ...ev,
      creador: ev.creador_num_doc ? { numero_documento: ev.creador_num_doc, nombres: ev.creador_nombres, apellidos: ev.creador_apellidos } : null,
      sitio: ev.id_sitio ? { id_sitio: ev.id_sitio, nombre_sitio: ev.nombre_sitio, direccion: ev.sitio_direccion, telefono_1: ev.sitio_telefono_1, telefono_2: ev.sitio_telefono_2 } : null,
      municipio: ev.id_municipio ? { id_municipio: ev.id_municipio, nombre_municipio: ev.nombre_municipio } : null,
      fecha_creacion: ev.fecha_creacion_evento,
    }));

    if (idParam) {
      const single = mapped.length ? mapped[0] : null;
      return NextResponse.json({ ok: true, event: single });
    }

    return NextResponse.json({ ok: true, eventos: mapped });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error obteniendo eventos" }, { status: 500 });
  }
}
