import { NextResponse } from "next/server";
import { uploadDocumentBuffer, uploadImageBuffer } from "@/lib/document-storage";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";
import { PERMISSION_IDS } from "@/lib/permissions";

export const runtime = "nodejs";

const ALPHANUM_SPACE_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ ]+$/;
const TEXT_WITH_PUNCT_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ .,;:()"'¿?¡!\-_/\n\r]+$/;


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
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const cookies = parseCookies(cookieHeader);
        const token = cookies["token"];
        if (token) {
          const payload = verifyToken(token);
          const userIdFromToken = payload?.id_usuario;
          if (payload && userIdFromToken) {
            requesterId = String(userIdFromToken);
          }
        }
      }
      if (!requesterId) {
        return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
      }
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
    if (!docFile || !(docFile as unknown as any).size) {
      return NextResponse.json({ ok: false, message: "Debes cargar un documento PDF para crear el evento" }, { status: 400 });
    }

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


    const nombre_evento = ((formData.get("nombre_evento") as string) || "").trim();
    const pulepRaw = ((formData.get("pulep_evento") as string) || "").trim();
    const pulep_evento = pulepRaw ? pulepRaw.toUpperCase() : null;
    const responsable_evento = ((formData.get("responsable_evento") as string) || "").trim();
    const descripcion = ((formData.get("descripcion") as string) || "").trim();
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
    const cupoRaw = String(formData.get("cupo") || "").trim();
    const cupo = /^\d+$/.test(cupoRaw) ? Number(cupoRaw) : NaN;
    const estado = String(formData.get("estado") || "true") === "true";
    const reservar_anticipado = String(formData.get("reservar_anticipado") || "false") === "true";

    const gratis_pago = String(formData.get("gratis_pago") || "false") === "true"; // TRUE => PAGO


    const boletasRaw = formData.get("boletas") as string | null;
    const costosRaw = formData.get("costos") as string | null;
    const tiposRaw = formData.get("tiposBoleteria") as string | null;
    const linksRaw = formData.get("linksBoleteria") as string | null;
    const boletasParsed: Array<{ nombre_boleto?: string; precio_boleto?: string | number; servicio?: string | number }> =
      boletasRaw ? JSON.parse(boletasRaw) : [];
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

    if (!nombre_evento || nombre_evento.length < 6) {
      return NextResponse.json({ ok: false, message: "El nombre del evento debe tener al menos 6 caracteres" }, { status: 400 });
    }

    if (!ALPHANUM_SPACE_REGEX.test(nombre_evento)) {
      return NextResponse.json({ ok: false, message: "El nombre del evento solo permite letras y números" }, { status: 400 });
    }

    if (!responsable_evento || responsable_evento.length < 6) {
      return NextResponse.json({ ok: false, message: "El responsable del evento es obligatorio y debe tener al menos 6 caracteres" }, { status: 400 });
    }

    if (!ALPHANUM_SPACE_REGEX.test(responsable_evento)) {
      return NextResponse.json({ ok: false, message: "El responsable del evento solo permite letras y números" }, { status: 400 });
    }

    if (!descripcion || descripcion.length < 10) {
      return NextResponse.json({ ok: false, message: "La descripción del evento debe tener al menos 10 caracteres" }, { status: 400 });
    }

    if (!TEXT_WITH_PUNCT_REGEX.test(descripcion)) {
      return NextResponse.json({ ok: false, message: "La descripción del evento contiene caracteres no permitidos" }, { status: 400 });
    }

    if (!Number.isInteger(cupo) || cupo <= 20 || cupo >= 5000) {
      return NextResponse.json({ ok: false, message: "El aforo debe ser un número entero mayor a 20 y menor a 5000" }, { status: 400 });
    }

    for (const infoItem of infoItems) {
      if (!TEXT_WITH_PUNCT_REGEX.test(infoItem.detalle)) {
        return NextResponse.json({ ok: false, message: "La información adicional contiene caracteres no permitidos" }, { status: 400 });
      }
    }

    if (pulep_evento && !/^[A-Z0-9]{6,8}$/.test(pulep_evento)) {
      return NextResponse.json(
        { ok: false, message: "El código PULEP debe tener entre 6 y 8 caracteres y solo usar letras mayúsculas y números" },
        { status: 400 }
      );
    }

    if (docFile && documentoStorageKey && !documentoOriginalFilename) {
      documentoOriginalFilename = "documento.pdf";
    }

    const eventPayload = {
      nombre_evento,
      pulep_evento,
      responsable_evento,
      id_categoria_evento,
      id_tipo_evento,
      id_sitio,
      descripcion,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_final,
      gratis_pago,
      cupo,
      reservar_anticipado,
      estado,
    };

    const phonesPayload = [
      ...(telefono_1 ? [{ telefono: telefono_1, es_principal: true }] : []),
      ...(telefono_2 ? [{ telefono: telefono_2, es_principal: false }] : []),
    ];

    const normalizedBoletas = (Array.isArray(boletasParsed) ? boletasParsed : [])
      .map((boleta) => ({
        nombre_boleto: String(boleta?.nombre_boleto || "").trim(),
        precio_boleto: String(boleta?.precio_boleto ?? "").replace(/[^0-9]/g, ""),
        servicio: String(boleta?.servicio ?? "").replace(/[^0-9]/g, ""),
      }))
      .filter((boleta) => boleta.nombre_boleto.length > 0 || boleta.precio_boleto.length > 0 || boleta.servicio.length > 0);

    if (gratis_pago) {
      if (normalizedBoletas.length === 0) {
        return NextResponse.json({ ok: false, message: "Debes definir al menos una boleta para eventos de pago" }, { status: 400 });
      }

      for (const boleta of normalizedBoletas) {
        if (boleta.nombre_boleto.length < 3 || !ALPHANUM_SPACE_REGEX.test(boleta.nombre_boleto)) {
          return NextResponse.json({ ok: false, message: "El nombre de la boleta solo permite letras y números y mínimo 3 caracteres" }, { status: 400 });
        }
        const precio = Number(boleta.precio_boleto);
        const servicio = boleta.servicio.length ? Number(boleta.servicio) : 0;
        if (!Number.isInteger(precio) || precio <= 0 || precio > 500000000) {
          return NextResponse.json({ ok: false, message: "El precio de la boleta debe ser un entero positivo y no mayor a 500.000.000" }, { status: 400 });
        }
        if (!Number.isInteger(servicio) || servicio < 0 || servicio > 500000000) {
          return NextResponse.json({ ok: false, message: "El cargo por servicio debe ser un entero entre 0 y 500.000.000" }, { status: 400 });
        }
      }
    }

    const ticketsPayload = gratis_pago
      ? normalizedBoletas.length > 0
        ? normalizedBoletas.map((boleta) => ({
            nombre_boleto: boleta.nombre_boleto,
            precio_boleto: Number(boleta.precio_boleto),
            servicio: boleta.servicio.length ? Number(boleta.servicio) : 0,
          }))
        : tiposBoleteria.map((nombreBoleto, i) => {
            const costoRaw = costos[i] || "";
            const precioBoleto = parseFloat(costoRaw.replace(/[^0-9.,-]/g, "").replace(",", ".")) || 0;
            return {
              nombre_boleto: nombreBoleto,
              precio_boleto: precioBoleto,
              servicio: 0,
            };
          })
      : [];

    const imagesPayload = uploadedImages.map((image) => ({
      url_imagen_evento: image.url,
      storage_provider: image.provider,
      storage_key: image.storageKey,
      mime_type: image.mimeType,
      bytes: image.bytes,
      original_filename: image.originalFileName,
    }));

    const documentPayload = documentoUrl || documentoStorageKey
      ? {
          url_documento_evento: documentoUrl || `bucket://${documentoStorageKey}`,
          storage_provider: documentoStorageProvider,
          storage_key: documentoStorageKey,
          mime_type: documentoMimeType,
          bytes: documentoBytes,
          original_filename: documentoOriginalFilename,
        }
      : null;

    const dbResult = await client.query(
      `SELECT app_api.fn_evento_crear(
         $1,
         $2::jsonb,
         $3::jsonb,
         $4::jsonb,
         $5::jsonb,
         $6::jsonb,
         $7::jsonb,
         $8::jsonb
       ) AS payload`,
      [
        Number(userId),
        JSON.stringify(eventPayload),
        JSON.stringify(phonesPayload),
        JSON.stringify(infoItems),
        JSON.stringify(ticketsPayload),
        JSON.stringify(linksBoleteria.filter(Boolean)),
        JSON.stringify(imagesPayload),
        documentPayload ? JSON.stringify(documentPayload) : null,
      ]
    );

    const payload = dbResult.rows?.[0]?.payload;
    if (!payload?.ok) {
      return NextResponse.json({ ok: false, message: payload?.error || "Error creando evento" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, eventId: payload.id_evento });
  } catch (err) {
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
        const cookieHeader = req.headers.get("cookie");
        if (cookieHeader) {
          const cookies = parseCookies(cookieHeader);
          const token = cookies["token"];
          if (token) {
            const payload = verifyToken(token);
            const userIdFromToken = payload?.id_usuario;
            if (payload && userIdFromToken) {
              requesterId = String(userIdFromToken);
            }
          }
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

    const dbResult = await pool.query(
      `SELECT app_api.fn_eventos_listar_json($1, $2, $3, $4, $5) AS payload`,
      [
        idNum,
        idPublicoParam || null,
        onlyMine,
        includeAll,
        requesterId ? Number(requesterId) : null,
      ]
    );

    const payload = dbResult.rows?.[0]?.payload;

    if (idParam || idPublicoParam) {
      if (!payload?.ok) {
        return NextResponse.json({ ok: false, message: payload?.error || "Evento no encontrado" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, event: payload.event });
    }

    if (!payload?.ok) {
      return NextResponse.json({ ok: false, message: payload?.error || "Error obteniendo eventos" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, eventos: payload.eventos || [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error obteniendo eventos" }, { status: 500 });
  }
}
