import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { getRequesterIdLenient } from "@/lib/auth-request"

async function getAuthenticatedUser(req: Request) {
  const userId = getRequesterIdLenient(req)
  if (!userId) return null

  const res = await pool.query(
    "SELECT id_usuario, id_rol, estado_usuario AS estado FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1",
    [userId]
  )
  if (!res.rows || res.rows.length === 0) return null
  return res.rows[0]
}

// POST /api/me/deactivate
// Permite a cualquier usuario autenticado desactivar su propia cuenta.
// Admins (rol 4) y moderadores (rol 3) no pueden auto-desactivarse por esta vía.
export async function POST(req: Request) {
  const client = await pool.connect()
  try {
    const user = await getAuthenticatedUser(req)

    if (!user) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 })
    }

    const rol = Number(user.id_rol)

    if (rol === 3 || rol === 4) {
      return NextResponse.json(
        { ok: false, message: "Las cuentas administrativas no pueden auto-desactivarse" },
        { status: 403 }
      )
    }

    if (user.estado === false) {
      return NextResponse.json(
        { ok: false, message: "La cuenta ya está inactiva" },
        { status: 400 }
      )
    }

    await client.query("BEGIN")

    await client.query(
      `UPDATE tabla_usuarios
       SET estado_usuario      = FALSE,
           fecha_actualizacion = CURRENT_TIMESTAMP,
           fecha_desactivacion = CURRENT_TIMESTAMP
       WHERE id_usuario = $1`,
      [user.id_usuario]
    )

    const motivoAutoDesactivacion = await client.query(
      `SELECT id_motivo_ban
       FROM tabla_motivos_ban
       WHERE id_categoria_ban = 8
       ORDER BY id_motivo_ban ASC
       LIMIT 1`
    )

    const idMotivoBan = Number(motivoAutoDesactivacion.rows[0]?.id_motivo_ban)
    if (!Number.isFinite(idMotivoBan) || idMotivoBan <= 0) {
      throw new Error("No existe un motivo de ban administrativo para registrar la auto-desactivación")
    }

    await client.query(
      `INSERT INTO tabla_baneados (id_usuario, motivo_ban, inicio_ban, fin_ban, responsable_baneo)
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $1)`,
      [user.id_usuario, idMotivoBan, new Date("2099-12-31").toISOString()]
    )

    await client.query("COMMIT")

    return NextResponse.json({
      ok: true,
      message: "Tu cuenta ha sido desactivada. Contacta a soporte para reactivarla.",
    })
  } catch (error) {
    try { await client.query("ROLLBACK") } catch {}
    console.error("[POST /api/me/deactivate]", error)
    return NextResponse.json(
      { ok: false, message: "Error al desactivar la cuenta" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}