import { NextResponse } from "next/server";
import { uploadDocumentBuffer, uploadImageBuffer } from "@/lib/document-storage";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { PERMISSION_IDS } from "@/lib/permissions";

export const runtime = "nodejs";


export async function POST(req: Request) {
  const client = await pool.connect();
  try {
    const authHeader = req.headers.get("authorization") || "";
    let requesterId: string | null = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      const payload = verifyToken(token);
      const userIdFromToken = payload?.id_usuario;
      if (!payload || !userIdFromToken) {
        return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });
      }
      requesterId = String(userIdFromToken);
    } else {
      let session: any = null;
      try {
        const { getAuth } = await import("@/lib/auth");
        session = await getAuth().api.getSession({ headers: req.headers as any });
      } catch (error) {
        console.error("BetterAuth session error", error);
        return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
      }
      const sid = (session && session.user && (session.user as any).id_usuario) || null;
      if (!sid) {
        return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
      }
      requesterId = String(sid);
    }

    const roleRes = await client.query(
      "SELECT id_rol FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1",
      [requesterId]
    );
    const role = roleRes.rows && roleRes.rows[0] ? Number(roleRes.rows[0].id_rol) : null;
    if (!role) {
      return NextResponse.json({ ok: false, message: "User role not found" }, { status: 403 });
    }

    const permissionRes = await client.query(
      `SELECT id_accesibilidad_menu_x_rol
       FROM tabla_accesibilidad_menu_x_rol
       WHERE id_accesibilidad = $1 AND id_rol = $2
       LIMIT 1`,
      [PERMISSION_IDS.CREAR_EVENTOS, role]
    );

    if (!permissionRes.rows || permissionRes.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();


    const maxImages = 8;
    const maxDocBytes = 5 * 1024 * 1024;

    const files = formData.getAll("additionalImages") as File[];
    if (files.length > maxImages) {
      return NextResponse.json({ ok: false, message: "Maximo 8 imagenes" }, { status: 400 });
    }
    const uploadedImages: Array<{
      url: string;
      provider: string;
      storageKey: string;
      mimeType: string;
      bytes: number;
      originalFileName: string;
    }> = [];
    for (const f of files) {
      const buffer = Buffer.from(await f.arrayBuffer());
      const result = await uploadImageBuffer({
        buffer,
        contentType: String((f as any).type || "image/jpeg"),
        originalFileName: String((f as any).name || "imagen.jpg"),
      });
      const imageUrl = result.publicUrl || `/api/events/image?key=${encodeURIComponent(result.storageKey)}`;
      uploadedImages.push({
        url: imageUrl,
        provider: result.provider,
        storageKey: result.storageKey,
        mimeType: result.mimeType,
        bytes: result.sizeBytes,
        originalFileName: result.originalFileName,
      });
    }


    const docFile = formData.get("documento") as File | null;
    let documentoUrl: string | null = null;
    let documentoStorageProvider: string | null = null;
    let documentoStorageKey: string | null = null;
    let documentoMimeType: string | null = null;
    let documentoBytes: number | null = null;
    let documentoOriginalFilename: string | null = null;
    if (docFile && (docFile as unknown as any).size) {
      const fileName = String((docFile as any).name || "").toLowerCase();
      const fileType = String((docFile as any).type || "").toLowerCase();
      const isPdf = fileType === "application/pdf" || fileName.endsWith(".pdf");
      if (!isPdf) {
        return NextResponse.json({ ok: false, message: "Solo se permite cargar un documento PDF" }, { status: 400 });
      }
      const docSize = (docFile as unknown as any).size as number;
      if (docSize > maxDocBytes) {
        return NextResponse.json({ ok: false, message: "Documento supera 5 MB" }, { status: 400 });
      }
      const bufferDoc = Buffer.from(await docFile.arrayBuffer());
      const docResult = await uploadDocumentBuffer({
        buffer: bufferDoc,
        contentType: "application/pdf",
        originalFileName: String((docFile as any).name || "documento.pdf"),
      });
      documentoUrl = docResult.publicUrl;
      documentoStorageProvider = docResult.provider;
      documentoStorageKey = docResult.storageKey;
      documentoMimeType = docResult.mimeType;
      documentoBytes = docResult.sizeBytes;
      documentoOriginalFilename = docResult.originalFileName;
    }


    const nombre_evento = (formData.get("nombre_evento") as string) || "";
  const pulep_evento = ((formData.get("pulep_evento") as string) || "").trim() || null;
  const responsable_evento = ((formData.get("responsable_evento") as string) || "").trim();
    const descripcion = (formData.get("descripcion") as string) || "";
    const infoItemsRaw = (formData.get("informacion_adicional_items") as string) || "[]";
    const fecha_inicio = (formData.get("fecha_inicio") as string) || null;
    const fecha_fin = (formData.get("fecha_fin") as string) || null;
    const hora_inicio = (formData.get("hora_inicio") as string) || null;
    const hora_final = (formData.get("hora_final") as string) || null;
    const userId = String(requesterId || "");

    const id_categoria_evento = Number(formData.get("id_categoria_evento") || 0);
    const id_tipo_evento = Number(formData.get("id_tipo_evento") || 0);
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
    const infoItemsParsed: Array<{ detalle: string; obligatorio?: boolean }> =
      infoItemsRaw ? JSON.parse(infoItemsRaw) : [];
    const infoItems = (Array.isArray(infoItemsParsed) ? infoItemsParsed : [])
      .map((item) => ({
        detalle: String(item?.detalle || "").trim(),
        obligatorio: Boolean(item?.obligatorio),
      }))
      .filter((item) => item.detalle.length >= 5)
      .slice(0, 20);

    if (!responsable_evento || responsable_evento.length < 6) {
      return NextResponse.json({ ok: false, message: "El responsable del evento es obligatorio y debe tener al menos 6 caracteres" }, { status: 400 });
    }


    await client.query('BEGIN');

    const insertEventRes = await client.query(
      `INSERT INTO tabla_eventos (
        nombre_evento, pulep_evento, responsable_evento, id_usuario, id_categoria_evento, id_tipo_evento, id_sitio,
        descripcion, telefono_1, telefono_2, fecha_inicio, fecha_fin, hora_inicio, hora_final,
        gratis_pago, cupo, estado
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING id_evento`,
      [
        nombre_evento,
        pulep_evento,
        responsable_evento,
        userId,
        id_categoria_evento,
        id_tipo_evento,
        id_sitio,
        descripcion,
        telefono_1,
        telefono_2,
        fecha_inicio,
        fecha_fin,
        hora_inicio,
        hora_final,
        gratis_pago,
        cupo,
        estado,
      ]
    );

    const newEventId = Number(insertEventRes.rows[0]?.id_evento);

    if (docFile && documentoStorageKey && !documentoOriginalFilename) {
      documentoOriginalFilename = `evento-${newEventId}.pdf`;
    }

    const detalleInformacionImportante = infoItems
      .map((item, index) => `${index + 1}. ${item.detalle}`)
      .join("\n");
    const obligatorioInformacionImportante = infoItems.some((item) => item.obligatorio);

    if (detalleInformacionImportante.length >= 5) {
      await client.query(
        `INSERT INTO tabla_evento_informacion_importante (id_evento, detalle, obligatorio)
         VALUES ($1,$2,$3)`,
        [newEventId, detalleInformacionImportante, obligatorioInformacionImportante]
      );
    }


    for (const image of uploadedImages) {
      await client.query(
        `INSERT INTO tabla_imagenes_eventos (
          url_imagen_evento,
          id_evento,
          storage_provider,
          storage_key,
          mime_type,
          bytes,
          original_filename
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          image.url,
          newEventId,
          image.provider,
          image.storageKey,
          image.mimeType,
          image.bytes,
          image.originalFileName,
        ]
      );
    }


    if (documentoUrl) {
      await client.query(
        `INSERT INTO tabla_documentos_eventos (
          id_evento,
          url_documento_evento,
          storage_provider,
          storage_key,
          mime_type,
          bytes,
          original_filename
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          newEventId,
          documentoUrl,
          documentoStorageProvider,
          documentoStorageKey,
          documentoMimeType,
          documentoBytes,
          documentoOriginalFilename,
        ]
      );
    } else if (documentoStorageKey) {
      await client.query(
        `INSERT INTO tabla_documentos_eventos (
          id_evento,
          url_documento_evento,
          storage_provider,
          storage_key,
          mime_type,
          bytes,
          original_filename
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          newEventId,
          `bucket://${documentoStorageKey}`,
          documentoStorageProvider,
          documentoStorageKey,
          documentoMimeType,
          documentoBytes,
          documentoOriginalFilename,
        ]
      );
    }

    for (const link of linksBoleteria.filter(Boolean)) {
      await client.query(`INSERT INTO tabla_links (id_evento, link) VALUES ($1,$2)`, [newEventId, link]);
    }

    if (gratis_pago) {
      for (let i = 0; i < tiposBoleteria.length; i++) {
        const nombreBoleto = tiposBoleteria[i];
        const costoRaw = costos[i] || '';

        const precioBoleto = parseFloat(costoRaw.replace(/[^0-9.,-]/g, '').replace(',', '.')) || 0;

        await client.query(`INSERT INTO tabla_boleteria (id_evento, nombre_boleto, precio_boleto) VALUES ($1,$2,$3)`, [newEventId, nombreBoleto, precioBoleto]);
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
    const idPublicoParam = (url.searchParams.get('idPublico') || '').trim();
    const mineParam = (url.searchParams.get('mine') || '').trim().toLowerCase();
    const onlyMine = mineParam === 'true' || mineParam === '1';
    const includeAllParam = (url.searchParams.get('includeAll') || '').trim().toLowerCase();
    const includeAll = includeAllParam === 'true' || includeAllParam === '1';

    // Validate id parameter to avoid passing NaN to the DB query
    const idNum = idParam !== null ? Number(idParam) : null;
    if (idParam !== null && (!Number.isFinite(idNum) || Number.isNaN(idNum))) {
      return NextResponse.json({ ok: false, message: 'Invalid id parameter' }, { status: 400 });
    }

    if (idPublicoParam && idPublicoParam.length < 6) {
      return NextResponse.json({ ok: false, message: 'Invalid idPublico parameter' }, { status: 400 });
    }

    if (onlyMine && includeAll) {
      return NextResponse.json({ ok: false, message: 'Invalid query combination' }, { status: 400 });
    }

    let requesterId: string | null = null;
    if (onlyMine || includeAll) {
      const authHeader = (req.headers.get("authorization") || "").trim();
      if (authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7).trim();
        const payload = verifyToken(token);
        const userIdFromToken = payload?.id_usuario;
        if (payload && userIdFromToken) {
          requesterId = String(userIdFromToken);
        }
      }

      if (!requesterId) {
        try {
          const { getAuth } = await import("@/lib/auth");
          const session = await getAuth().api.getSession({ headers: req.headers as any });
          const sid = (session && session.user && (session.user as any).id_usuario) || null;
          if (sid) requesterId = String(sid);
        } catch (error) {
          console.error("BetterAuth session error", error);
        }
      }

      if (!requesterId) {
        return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
      }

      if (includeAll) {
        const roleRes = await pool.query(
          "SELECT id_rol FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1",
          [requesterId]
        );
        const role = roleRes.rows && roleRes.rows[0] ? Number(roleRes.rows[0].id_rol) : null;
        if (!role) {
          return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
        }

        const permissionRes = await pool.query(
          `SELECT id_accesibilidad_menu_x_rol
           FROM tabla_accesibilidad_menu_x_rol
           WHERE id_accesibilidad = $1 AND id_rol = $2
           LIMIT 1`,
          [PERMISSION_IDS.GESTIONAR_EVENTOS, role]
        );

        if (!permissionRes.rows || permissionRes.rows.length === 0) {
          return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
        }
      }
    }

    const queryParams: Array<number | string> = [];
    const filters: string[] = [];

    if (onlyMine && requesterId) {
      queryParams.push(requesterId);
      filters.push(`e.id_usuario = $${queryParams.length}`);
    } else if (!includeAll) {
      filters.push("e.estado = TRUE");
    }

    if (idNum !== null) {
      queryParams.push(idNum);
      filters.push(`e.id_evento = $${queryParams.length}`);
    } else if (idPublicoParam) {
      queryParams.push(idPublicoParam);
      filters.push(`e.id_publico_evento = $${queryParams.length}`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    const result = await pool.query(`
      SELECT e.id_evento,
             e.id_publico_evento,
             e.pulep_evento,
             e.nombre_evento,
             e.responsable_evento,
             e.id_usuario,
             e.id_categoria_evento,
             e.id_tipo_evento,
             e.id_sitio,
             e.descripcion,
             e.telefono_1,
             e.telefono_2,
             e.fecha_inicio,
             e.fecha_fin,
             e.hora_inicio,
             e.hora_final,
             e.gratis_pago,
             e.cupo,
             e.reservar_anticipado,
             e.estado,
             e.fecha_creacion,
             e.fecha_actualizacion,
             e.fecha_desactivacion,
             u.nombres AS creador_nombres,
             u.apellidos AS creador_apellidos,
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
             i.storage_provider AS imagen_storage_provider,
             i.storage_key AS imagen_storage_key,
             i.mime_type AS imagen_mime_type,
             i.bytes AS imagen_bytes,
             i.original_filename AS imagen_original_filename,
             d.id_documento_evento,
             d.url_documento_evento,
             d.storage_provider,
             d.storage_key,
             d.mime_type,
             d.bytes,
             d.original_filename,
             b.id_boleto,
             b.nombre_boleto,
             b.precio_boleto,
             b.servicio,
             l.id_link,
             l.link,
             iinfo.id_evento_info_item,
             iinfo.detalle AS info_importante_detalle,
             iinfo.obligatorio AS info_importante_obligatorio,
             vr.id_valoracion AS id_valoracion,
             vr.id_usuario AS valoracion_usuario,
             vr.valoracion AS valoracion_valor,
             vr.comentario AS valoracion_comentario,
                  vr.fecha_creacion AS valoracion_fecha,
                  COALESCE(rv.reservas_count, 0) AS reservas_count,
                  COALESCE(rv.reservas_asistentes, 0) AS reservas_asistentes
      FROM tabla_eventos e
      LEFT JOIN tabla_usuarios u ON e.id_usuario = u.id_usuario
      LEFT JOIN tabla_sitios s ON e.id_sitio = s.id_sitio
      LEFT JOIN tabla_municipios m ON s.id_municipio = m.id_municipio
      LEFT JOIN tabla_categoria_eventos ce ON e.id_categoria_evento = ce.id_categoria_evento
      LEFT JOIN tabla_tipo_eventos te ON e.id_tipo_evento = te.id_tipo_evento
      LEFT JOIN tabla_imagenes_eventos i ON e.id_evento = i.id_evento
      LEFT JOIN tabla_documentos_eventos d ON e.id_evento = d.id_evento
      LEFT JOIN tabla_boleteria b ON e.id_evento = b.id_evento
      LEFT JOIN tabla_links l ON e.id_evento = l.id_evento
      LEFT JOIN tabla_evento_informacion_importante iinfo ON e.id_evento = iinfo.id_evento
      LEFT JOIN tabla_valoraciones vr ON e.id_evento = vr.id_evento
      LEFT JOIN (
        SELECT
          id_evento,
          COUNT(*)::INT AS reservas_count,
          COALESCE(SUM(cuantos_asistiran), 0)::INT AS reservas_asistentes
        FROM tabla_reserva_eventos
        WHERE estado = TRUE
        GROUP BY id_evento
      ) rv ON e.id_evento = rv.id_evento
      ${whereClause}
      ORDER BY e.id_evento DESC;
    `, queryParams);

    const eventosMap: Record<string, any> = {};
    result.rows.forEach((row) => {
      if (!eventosMap[row.id_evento]) {
        eventosMap[row.id_evento] = {
          id_evento: row.id_evento,
          id_publico_evento: row.id_publico_evento,
          pulep_evento: row.pulep_evento,
          nombre_evento: row.nombre_evento,
          responsable_evento: row.responsable_evento,
          id_usuario: row.id_usuario,
          id_categoria_evento: row.id_categoria_evento,
          id_tipo_evento: row.id_tipo_evento,
          id_sitio: row.id_sitio,
          descripcion: row.descripcion,
          telefono_1: row.telefono_1,
          telefono_2: row.telefono_2,
          fecha_inicio: row.fecha_inicio,
          fecha_fin: row.fecha_fin,
          hora_inicio: row.hora_inicio,
          hora_final: row.hora_final,
          gratis_pago: row.gratis_pago,
          cupo: row.cupo,
          reservar_anticipado: row.reservar_anticipado,
          estado: row.estado,
          fecha_creacion: row.fecha_creacion,
          fecha_actualizacion: row.fecha_actualizacion,
          fecha_desactivacion: row.fecha_desactivacion,
          creador_nombres: row.creador_nombres,
          creador_apellidos: row.creador_apellidos,
          nombre_sitio: row.nombre_sitio,
          sitio_direccion: row.sitio_direccion,
          sitio_telefono_1: row.sitio_telefono_1,
          sitio_telefono_2: row.sitio_telefono_2,
          id_municipio: row.id_municipio,
          nombre_municipio: row.nombre_municipio,
          evento_categoria_id: row.evento_categoria_id,
          categoria_nombre: row.categoria_nombre,
          evento_tipo_id: row.evento_tipo_id,
          tipo_nombre: row.tipo_nombre,
          reservas_count: Number(row.reservas_count || 0),
          reservas_asistentes: Number(row.reservas_asistentes || 0),
          informacion_importante: row.id_evento_info_item
            ? {
                id_evento_info_item: row.id_evento_info_item,
                detalle: row.info_importante_detalle,
                obligatorio: row.info_importante_obligatorio,
              }
            : null,
          imagenes: [],
          documentos: [],
          valores: [],
          links: [],
        };
      }

      if (row.url_imagen_evento) {
        if (!eventosMap[row.id_evento].imagenes.some((img: any) => img.id_imagen_evento === row.id_imagen_evento)) {
          eventosMap[row.id_evento].imagenes.push({
            id_imagen_evento: row.id_imagen_evento,
            url_imagen_evento:
              (row.imagen_storage_provider === "r2" || row.imagen_storage_provider === "s3") && row.id_imagen_evento
                ? `/api/events/image?id=${encodeURIComponent(String(row.id_imagen_evento))}`
                : row.url_imagen_evento,
            storage_provider: row.imagen_storage_provider,
            storage_key: row.imagen_storage_key,
            mime_type: row.imagen_mime_type,
            bytes: row.imagen_bytes,
            original_filename: row.imagen_original_filename,
          });
        }
      }

      if (row.url_documento_evento) {
        if (!eventosMap[row.id_evento].documentos.some((d: any) => d.url_documento_evento === row.url_documento_evento)) {
          eventosMap[row.id_evento].documentos.push({
            id_documento_evento: row.id_documento_evento,
            url_documento_evento: row.url_documento_evento,
            storage_provider: row.storage_provider,
            storage_key: row.storage_key,
            mime_type: row.mime_type,
            bytes: row.bytes,
            original_filename: row.original_filename,
          });
        }
      }

      if (row.id_boleto) {
        eventosMap[row.id_evento].valores.push({
          id_boleto: row.id_boleto,
          nombre_boleto: row.nombre_boleto,
          precio_boleto: row.precio_boleto,
          servicio: row.servicio,
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
      creador: ev.id_usuario ? { id_usuario: ev.id_usuario, nombres: ev.creador_nombres, apellidos: ev.creador_apellidos } : null,
      sitio: ev.id_sitio ? { id_sitio: ev.id_sitio, nombre_sitio: ev.nombre_sitio, direccion: ev.sitio_direccion, telefono_1: ev.sitio_telefono_1, telefono_2: ev.sitio_telefono_2 } : null,
      municipio: ev.id_municipio ? { id_municipio: ev.id_municipio, nombre_municipio: ev.nombre_municipio } : null,
      categoria: ev.evento_categoria_id ? { id_categoria_evento: ev.evento_categoria_id, nombre: ev.categoria_nombre } : null,
      tipo_evento: ev.evento_tipo_id ? { id_tipo_evento: ev.evento_tipo_id, nombre: ev.tipo_nombre } : null,
    }));

    if (idParam || idPublicoParam) {
      const single = mapped.length ? mapped[0] : null;
      if (!single) {
        return NextResponse.json({ ok: false, message: "Evento no encontrado" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, event: single });
    }

    return NextResponse.json({ ok: true, eventos: mapped });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error obteniendo eventos" }, { status: 500 });
  }
}
