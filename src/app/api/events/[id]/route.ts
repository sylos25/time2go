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
      const userIdFromToken = payload?.id_usuario;
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
        const userIdFromToken = payload?.id_usuario;
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

    const eventPayload = {
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
      cupo,
      reservar_anticipado,
      gratis_pago,
    };

    const phonesPayload = [
      ...(telefono_1 ? [{ telefono: telefono_1, es_principal: true }] : []),
      ...(telefono_2 ? [{ telefono: telefono_2, es_principal: false }] : []),
    ];

    const ticketsPayload = gratis_pago
      ? (Array.isArray(boletas) && boletas.length > 0
          ? boletas
              .map((boleta) => {
                const nombreBoleto = String(boleta?.nombre_boleto || "").trim();
                const precioRaw = String(boleta?.precio_boleto ?? "");
                const servicioRaw = String(boleta?.servicio ?? "");
                const precioBoleto = parseFloat(precioRaw.replace(/[^0-9.,-]/g, "").replace(",", ".")) || 0;
                const servicioBoleto = parseFloat(servicioRaw.replace(/[^0-9.,-]/g, "").replace(",", ".")) || 0;
                return nombreBoleto ? { nombre_boleto: nombreBoleto, precio_boleto: precioBoleto, servicio: servicioBoleto } : null;
              })
              .filter(Boolean)
          : tiposBoleteria.map((nombreBoleto, i) => {
              const costoRaw = costos[i] || "";
              const precioBoleto = parseFloat(costoRaw.replace(/[^0-9.,-]/g, "").replace(",", ".")) || 0;
              return { nombre_boleto: nombreBoleto, precio_boleto: precioBoleto, servicio: 0 };
            }))
      : [];

    const imagesPayload = uploadedImages.map((image) => ({
      url_imagen_evento: image.url,
      storage_provider: image.provider,
      storage_key: image.storageKey,
      mime_type: image.mimeType,
      bytes: image.bytes,
      original_filename: image.originalFileName,
    }));

    const updateResult = await client.query(
      `SELECT app_api.fn_evento_actualizar(
         $1,
         $2,
         $3::jsonb,
         $4::jsonb,
         $5::jsonb,
         $6::jsonb,
         $7::jsonb,
         $8::jsonb,
         $9::int[]
       ) AS payload`,
      [
        eventId,
        Number(user.id_usuario),
        JSON.stringify(eventPayload),
        JSON.stringify(phonesPayload),
        JSON.stringify(infoItems),
        JSON.stringify(ticketsPayload),
        JSON.stringify((linksBoleteria || []).filter(Boolean)),
        JSON.stringify(imagesPayload),
        imagesToDelete,
      ]
    );

    const updatePayload = updateResult.rows?.[0]?.payload;
    if (!updatePayload?.ok) {
      return NextResponse.json({ ok: false, message: updatePayload?.error || "Error updating event" }, { status: 400 });
    }

    // Return updated event
    const result = await client.query(
          `SELECT e.id_evento,
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
            e.fecha_creacion,
            e.fecha_actualizacion,
            e.fecha_desactivacion,
            tel_principal.telefono AS telefono_1,
            tel_secundario.telefono AS telefono_2,
            u.nombres,
            u.apellidos,
            s.nombre_sitio,
            m.nombre_municipio,
            ce.nombre as categoria_nombre,
            te.nombre as tipo_nombre
       FROM tabla_eventos e
      LEFT JOIN tabla_usuarios u ON e.id_usuario = u.id_usuario
       LEFT JOIN tabla_sitios s ON e.id_sitio = s.id_sitio
      LEFT JOIN tabla_municipios m ON s.id_municipio = m.id_municipio
       LEFT JOIN tabla_categoria_eventos ce ON e.id_categoria_evento = ce.id_categoria_evento
       LEFT JOIN tabla_tipo_eventos te ON e.id_tipo_evento = te.id_tipo_evento
       LEFT JOIN LATERAL (
         SELECT telefono
         FROM tabla_eventos_telefonos
         WHERE id_evento = e.id_evento AND es_principal = TRUE
         ORDER BY fecha_creacion ASC
         LIMIT 1
       ) tel_principal ON TRUE
       LEFT JOIN LATERAL (
         SELECT telefono
         FROM tabla_eventos_telefonos
         WHERE id_evento = e.id_evento AND es_principal = FALSE
         ORDER BY fecha_creacion ASC
         LIMIT 1
       ) tel_secundario ON TRUE
       WHERE e.id_evento = $1`,
      [eventId]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Event not found" }, { status: 404 });
    }

    const updatedEvent = result.rows[0];
    return NextResponse.json({ ok: true, event: updatedEvent });
  } catch (err) {
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

    const deleteResult = await client.query(
      `SELECT app_api.fn_evento_eliminar($1, $2) AS payload`,
      [eventId, Number(user.id_usuario)]
    );

    const payload = deleteResult.rows?.[0]?.payload;
    if (!payload?.ok) {
      const status = payload?.error === "Event not found" ? 404 : 400;
      return NextResponse.json({ ok: false, message: payload?.error || "Error deleting event" }, { status });
    }

    return NextResponse.json({ ok: true, message: "Evento eliminado correctamente" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error deleting event" }, { status: 500 });
  } finally {
    client.release();
  }
}
