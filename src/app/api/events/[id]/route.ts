import { NextResponse } from "next/server";
import { uploadImageBuffer } from "@/lib/document-storage";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";

export const runtime = "nodejs";

async function getAuthenticatedUser(req: Request, client: any) {
  const authHeader = (req.headers.get("authorization") || "").trim();
  let userId: string | null = null;

  if (authHeader.startsWith("Bearer ")) {
    try {
      const t = authHeader.slice(7).trim();
      const payload = verifyToken(t);
      const userIdFromToken = payload?.id_usuario || payload?.numero_documento;
      if (payload && userIdFromToken) userId = String(userIdFromToken);
    } catch (e) {
      console.error("token verification failed", e);
    }
  }

  if (!userId) {
    const cookies = parseCookies(req.headers.get("cookie"));
    const token = cookies["token"];
    if (token) {
      try {
        const payload = verifyToken(token);
        const userIdFromToken = payload?.id_usuario || payload?.numero_documento;
        if (payload && userIdFromToken) userId = String(userIdFromToken);
      } catch (e) {
        console.error("cookie token verification failed", e);
      }
    }
  }

  if (!userId) return null;

  const roleRes = await client.query(
    "SELECT id_usuario, id_rol FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1",
    [userId]
  );
  if (!roleRes.rows || roleRes.rows.length === 0) return null;

  return {
    id_usuario: String(roleRes.rows[0].id_usuario),
    id_rol: Number(roleRes.rows[0].id_rol),
  };
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const eventId = Number(id);
  const client = await pool.connect();
  try {
    if (!eventId) {
      return NextResponse.json({ ok: false, message: "Invalid event ID" }, { status: 400 });
    }

    const user = await getAuthenticatedUser(req, client);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    if (user.id_rol !== 4) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    // Check event exists
    const eventCheck = await client.query("SELECT id_evento FROM tabla_eventos WHERE id_evento = $1", [eventId]);
    if (!eventCheck.rows || eventCheck.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Event not found" }, { status: 404 });
    }

    const formData = await req.formData();

    // Upload new images
    const maxImages = 8;
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
      if (f && (f as any).size > 0) {
        const buffer = Buffer.from(await f.arrayBuffer());
        const result = await uploadImageBuffer({
          buffer,
          contentType: String((f as any).type || "image/jpeg"),
          originalFileName: String((f as any).name || "imagen.jpg"),
          eventId,
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
    }

    // Get images to delete
    const imagesToDeleteRaw = formData.get("imagesToDelete") as string | null;
    const imagesToDelete: number[] = imagesToDeleteRaw ? JSON.parse(imagesToDeleteRaw) : [];

    // Get form fields
    const nombre_evento = (formData.get("nombre_evento") as string) || "";
    const pulep_evento = ((formData.get("pulep_evento") as string) || "").trim() || null;
    const responsable_evento = ((formData.get("responsable_evento") as string) || "").trim();
    const descripcion = (formData.get("descripcion") as string) || "";
    const infoItemsRaw = (formData.get("informacion_adicional_items") as string) || "[]";
    const fecha_inicio = (formData.get("fecha_inicio") as string) || null;
    const fecha_fin = (formData.get("fecha_fin") as string) || null;
    const hora_inicio = (formData.get("hora_inicio") as string) || null;
    const hora_final = (formData.get("hora_final") as string) || null;
    const id_categoria_evento = Number(formData.get("id_categoria_evento") || 0);
    const id_tipo_evento = Number(formData.get("id_tipo_evento") || 0);
    const id_sitio = Number(formData.get("id_sitio") || 0);
    const telefono_1 = (formData.get("telefono_1") as string) || null;
    const telefono_2 = (formData.get("telefono_2") as string) || null;
    const cupo = parseInt((formData.get("cupo") as string) || "0") || 0;
    const dias_semana = (formData.get("dias_semana") as string) || null;
    const costosRaw = formData.get("costos") as string | null;
    const tiposRaw = formData.get("tiposBoleteria") as string | null;
    const linksRaw = formData.get("linksBoleteria") as string | null;
    const boletasRaw = formData.get("boletas") as string | null;
    const costos: string[] = costosRaw ? JSON.parse(costosRaw) : [];
    const tiposBoleteria: string[] = tiposRaw ? JSON.parse(tiposRaw) : [];
    const linksBoleteria: string[] = linksRaw ? JSON.parse(linksRaw) : [];
    const boletas: Array<{ nombre_boleto?: string; precio_boleto?: string | number; servicio?: string | number }> = boletasRaw
      ? JSON.parse(boletasRaw)
      : [];
    const gratis_pago = String(formData.get("gratis_pago") || "false") === "true";
    const reservar_anticipado = String(formData.get("reservar_anticipado") || "false") === "true";

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

    await client.query("BEGIN");

    // Update event
    await client.query(
      `UPDATE tabla_eventos SET 
        nombre_evento = $1,
        pulep_evento = $2,
        responsable_evento = $3,
        descripcion = $4,
        fecha_inicio = $5,
        fecha_fin = $6,
        hora_inicio = $7,
        hora_final = $8,
        id_categoria_evento = $9,
        id_tipo_evento = $10,
        id_sitio = $11,
        telefono_1 = $12,
        telefono_2 = $13,
        cupo = $14,
        reservar_anticipado = $15,
        gratis_pago = $16,
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_evento = $17`,
      [
        nombre_evento,
        pulep_evento,
        responsable_evento,
        descripcion,
        fecha_inicio,
        fecha_fin,
        hora_inicio,
        hora_final,
        id_categoria_evento,
        id_tipo_evento,
        id_sitio,
        telefono_1,
        telefono_2,
        cupo,
        reservar_anticipado,
        gratis_pago,
        eventId,
      ]
    );

    const detalleInformacionImportante = infoItems
      .map((item, index) => `${index + 1}. ${item.detalle}`)
      .join("\n");
    const obligatorioInformacionImportante = infoItems.some((item) => item.obligatorio);

    await client.query("DELETE FROM tabla_evento_informacion_importante WHERE id_evento = $1", [eventId]);
    if (detalleInformacionImportante.length >= 5) {
      await client.query(
        `INSERT INTO tabla_evento_informacion_importante (id_evento, detalle, obligatorio)
         VALUES ($1,$2,$3)`,
        [eventId, detalleInformacionImportante, obligatorioInformacionImportante]
      );
    }

    // Delete images
    for (const imageId of imagesToDelete) {
      await client.query("DELETE FROM tabla_imagenes_eventos WHERE id_imagen_evento = $1 AND id_evento = $2", [imageId, eventId]);
    }

    // Add new images
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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          image.url,
          eventId,
          image.provider,
          image.storageKey,
          image.mimeType,
          image.bytes,
          image.originalFileName,
        ]
      );
    }

    // Sync tickets (tabla_boleteria) and links (tabla_links)
    // Delete existing rows and re-insert based on submitted arrays
    await client.query("DELETE FROM tabla_boleteria WHERE id_evento = $1", [eventId]);
    await client.query("DELETE FROM tabla_links WHERE id_evento = $1", [eventId]);

    // Insert links
    for (const link of (linksBoleteria || []).filter(Boolean)) {
      await client.query(`INSERT INTO tabla_links (id_evento, link) VALUES ($1,$2)`, [eventId, link]);
    }

    // Insert ticket values if paid
    if (gratis_pago) {
      if (Array.isArray(boletas) && boletas.length > 0) {
        for (const boleta of boletas) {
          const nombreBoleto = String(boleta?.nombre_boleto || "").trim();
          if (!nombreBoleto) continue;

          const precioRaw = String(boleta?.precio_boleto ?? "");
          const servicioRaw = String(boleta?.servicio ?? "");
          const precioBoleto = parseFloat(precioRaw.replace(/[^0-9.,-]/g, "").replace(",", ".")) || 0;
          const servicioBoleto = parseFloat(servicioRaw.replace(/[^0-9.,-]/g, "").replace(",", ".")) || 0;

          await client.query(
            `INSERT INTO tabla_boleteria (id_evento, nombre_boleto, precio_boleto, servicio) VALUES ($1,$2,$3,$4)`,
            [eventId, nombreBoleto, precioBoleto, servicioBoleto]
          );
        }
      } else {
        for (let i = 0; i < tiposBoleteria.length; i++) {
          const nombreBoleto = tiposBoleteria[i];
          const costoRaw = costos[i] || '';

          const precioBoleto = parseFloat(costoRaw.replace(/[^0-9.,-]/g, '').replace(',', '.')) || 0;

          await client.query(`INSERT INTO tabla_boleteria (id_evento, nombre_boleto, precio_boleto, servicio) VALUES ($1,$2,$3,$4)`, [eventId, nombreBoleto, precioBoleto, 0]);
        }
      }
    }

    await client.query("COMMIT");

    // Return updated event
    const result = await client.query(
      `SELECT e.*, 
              u.nombres, u.apellidos,
              s.nombre_sitio, m.nombre_municipio,
              ce.nombre as categoria_nombre, te.nombre as tipo_nombre
       FROM tabla_eventos e
      LEFT JOIN tabla_usuarios u ON e.id_usuario = u.id_usuario
       LEFT JOIN tabla_sitios s ON e.id_sitio = s.id_sitio
      LEFT JOIN tabla_municipios m ON s.id_municipio = m.id_municipio
       LEFT JOIN tabla_categoria_eventos ce ON e.id_categoria_evento = ce.id_categoria_evento
       LEFT JOIN tabla_tipo_eventos te ON e.id_tipo_evento = te.id_tipo_evento
       WHERE e.id_evento = $1`,
      [eventId]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Event not found" }, { status: 404 });
    }

    const updatedEvent = result.rows[0];
    return NextResponse.json({ ok: true, event: updatedEvent });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error updating event" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const eventId = Number(id);
  const client = await pool.connect();
  try {
    if (!eventId) {
      return NextResponse.json({ ok: false, message: "Invalid event ID" }, { status: 400 });
    }

    const user = await getAuthenticatedUser(req, client);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    if (user.id_rol !== 4) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    await client.query("BEGIN");

    const exists = await client.query("SELECT id_evento FROM tabla_eventos WHERE id_evento = $1 LIMIT 1", [eventId]);
    if (!exists.rows || exists.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ ok: false, message: "Event not found" }, { status: 404 });
    }

    await client.query("DELETE FROM tabla_reserva_eventos WHERE id_evento = $1", [eventId]);
    await client.query("DELETE FROM tabla_valoraciones WHERE id_evento = $1", [eventId]);
    await client.query("DELETE FROM tabla_links WHERE id_evento = $1", [eventId]);
    await client.query("DELETE FROM tabla_boleteria WHERE id_evento = $1", [eventId]);
    await client.query("DELETE FROM tabla_documentos_eventos WHERE id_evento = $1", [eventId]);
    await client.query("DELETE FROM tabla_imagenes_eventos WHERE id_evento = $1", [eventId]);
    await client.query("DELETE FROM tabla_evento_informacion_importante WHERE id_evento = $1", [eventId]);
    await client.query("DELETE FROM tabla_eventos WHERE id_evento = $1", [eventId]);

    await client.query("COMMIT");
    return NextResponse.json({ ok: true, message: "Evento eliminado correctamente" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error deleting event" }, { status: 500 });
  } finally {
    client.release();
  }
}
