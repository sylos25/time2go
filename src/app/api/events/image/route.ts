import { NextRequest, NextResponse } from "next/server";
import { getDocumentFromStorage } from "@/lib/document-storage";
import pool from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const idParam = req.nextUrl.searchParams.get("id");
    const key = (req.nextUrl.searchParams.get("key") || "").trim();

    if (idParam) {
      const imageId = Number(idParam);
      if (!Number.isFinite(imageId) || imageId <= 0) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
      }

      const imageRes = await pool.query(
        `SELECT id_imagen_evento,
                url_imagen_evento,
                storage_provider,
                storage_key,
                mime_type,
                original_filename
         FROM tabla_imagenes_eventos
         WHERE id_imagen_evento = $1
         LIMIT 1`,
        [imageId]
      );

      if (!imageRes.rows || imageRes.rows.length === 0) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }

      const image = imageRes.rows[0];

      if ((image.storage_provider === "r2" || image.storage_provider === "s3") && image.storage_key) {
        const stored = await getDocumentFromStorage(String(image.storage_key));
        return new NextResponse(new Uint8Array(stored.bytes), {
          headers: {
            "Content-Type": String(image.mime_type || stored.contentType || "image/jpeg"),
            "Content-Length": String(stored.contentLength),
            "Cache-Control": "public, max-age=3600",
          },
        });
      }

      if (image.url_imagen_evento) {
        const external = await fetch(String(image.url_imagen_evento));
        if (!external.ok) {
          return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
        }
        const arrayBuffer = await external.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        return new NextResponse(uint8, {
          headers: {
            "Content-Type": external.headers.get("content-type") || "image/jpeg",
            "Content-Length": String(uint8.length),
            "Cache-Control": "public, max-age=3600",
          },
        });
      }

      return NextResponse.json({ error: "Image source unavailable" }, { status: 404 });
    }

    if (!key) {
      return NextResponse.json({ error: "Missing id or key" }, { status: 400 });
    }

    const stored = await getDocumentFromStorage(key);

    return new NextResponse(new Uint8Array(stored.bytes), {
      headers: {
        "Content-Type": stored.contentType || "image/jpeg",
        "Content-Length": String(stored.contentLength),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Error proxying image:", err);
    return NextResponse.json({ error: "Error proxying image" }, { status: 500 });
  }
}
