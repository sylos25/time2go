import { NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * Catálogo público: categorías y motivos para denunciar un evento (tablas DDL).
 */
export async function GET() {
  try {
    const catRes = await pool.query(
      `SELECT id_categoria_denuncia, nombre_categoria_denuncia
       FROM tabla_categoria_denuncia_evento
       ORDER BY id_categoria_denuncia ASC`
    );

    const motRes = await pool.query(
      `SELECT id_motivo_denuncia_evento, id_categoria_denuncia, nombre_motivo, descripcion_motivo
       FROM tabla_motivos_denuncia_eventos
       ORDER BY id_categoria_denuncia ASC, id_motivo_denuncia_evento ASC`
    );

    const categorias = (catRes.rows || []).map((row: Record<string, unknown>) => ({
      id_categoria_denuncia: Number(row.id_categoria_denuncia),
      nombre_categoria_denuncia: String(row.nombre_categoria_denuncia),
    }));

    const motivos = (motRes.rows || []).map((row: Record<string, unknown>) => ({
      id_motivo_denuncia_evento: Number(row.id_motivo_denuncia_evento),
      id_categoria_denuncia: Number(row.id_categoria_denuncia),
      nombre_motivo: String(row.nombre_motivo),
      descripcion_motivo: row.descripcion_motivo != null ? String(row.descripcion_motivo) : null,
    }));

    return NextResponse.json({ ok: true, categorias, motivos });
  } catch (e) {
    console.error("[denuncias-eventos/catalogo]", e);
    return NextResponse.json({ ok: false, message: "Error al cargar el catálogo" }, { status: 500 });
  }
}
