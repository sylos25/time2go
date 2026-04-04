import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { getRequesterIdLenient } from "@/lib/auth-request"
import { sendBanNotificationEmail, sendUnbanNotificationEmail } from "@/lib/email"

async function getRequester(req: Request, client: any) {
  const userId = await getRequesterIdLenient(req)
  if (!userId) return null

  const roleRes = await client.query(
    "SELECT id_usuario, id_rol FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1",
    [userId]
  )

  if (!roleRes.rows || roleRes.rows.length === 0) return null

  return {
    id_usuario: String(roleRes.rows[0].id_usuario),
    id_rol: Number(roleRes.rows[0].id_rol),
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const userIdToToggle = Number(id)

  if (!Number.isFinite(userIdToToggle) || userIdToToggle <= 0) {
    return NextResponse.json({ ok: false, message: "ID de usuario inválido" }, { status: 400 })
  }

  const client = await pool.connect()
  try {
    const requester = await getRequester(req, client)
    if (!requester) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
    }

    if (requester.id_rol !== 4) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const action = String(body?.action || "").toLowerCase()

    const userCheck = await client.query(
      "SELECT id_usuario, estado_usuario AS estado, id_rol FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1",
      [userIdToToggle]
    )
    if (!userCheck.rows || userCheck.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Usuario no encontrado" }, { status: 404 })
    }

    const targetRole = Number(userCheck.rows[0].id_rol)
    if (targetRole !== 1 && targetRole !== 2) {
      return NextResponse.json(
        { ok: false, message: "Solo se puede bannear/desbannear usuarios y organizadores" },
        { status: 403 }
      )
    }

    if (action === "ban") {
      const idUsuario = Number(body?.id_usuario ?? userIdToToggle)
      const motivoBanId = Number(body?.motivo_ban)
      const inicioBanRaw = String(body?.inicio_ban || "").trim()
      const finBanRaw = String(body?.fin_ban || "").trim()
      const responsable = Number(body?.responsable)

      if (!Number.isFinite(idUsuario) || idUsuario <= 0 || idUsuario !== userIdToToggle) {
        return NextResponse.json({ ok: false, message: "ID de usuario inválido" }, { status: 400 })
      }

      if (!Number.isFinite(motivoBanId) || motivoBanId <= 0) {
        return NextResponse.json({ ok: false, message: "Debes seleccionar un motivo de ban válido" }, { status: 400 })
      }

      if (!inicioBanRaw || !finBanRaw) {
        return NextResponse.json({ ok: false, message: "Debes indicar fecha de inicio y fecha final" }, { status: 400 })
      }

      const inicioBan = new Date(inicioBanRaw)
      const finBan = new Date(finBanRaw)

      if (Number.isNaN(inicioBan.getTime()) || Number.isNaN(finBan.getTime())) {
        return NextResponse.json({ ok: false, message: "Fechas de ban inválidas" }, { status: 400 })
      }

      if (finBan <= inicioBan) {
        return NextResponse.json({ ok: false, message: "La fecha final debe ser mayor que la fecha de inicio" }, { status: 400 })
      }

      if (!Number.isFinite(responsable) || responsable <= 0) {
        return NextResponse.json({ ok: false, message: "Responsable inválido" }, { status: 400 })
      }

      const responsableCheck = await client.query(
        "SELECT id_usuario FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1",
        [responsable]
      )
      if (!responsableCheck.rows || responsableCheck.rows.length === 0) {
        return NextResponse.json({ ok: false, message: "El responsable no existe" }, { status: 400 })
      }

      const motivoBanRes = await client.query(
        "SELECT id_motivo_ban, motivo_ban FROM tabla_motivos_ban WHERE id_motivo_ban = $1 LIMIT 1",
        [motivoBanId]
      )
      if (!motivoBanRes.rows || motivoBanRes.rows.length === 0) {
        return NextResponse.json({ ok: false, message: "El motivo de ban no existe" }, { status: 400 })
      }

      const motivoBanDescripcion = String(motivoBanRes.rows[0].motivo_ban)

      await client.query("BEGIN")

      await client.query(
        `INSERT INTO tabla_baneados (id_usuario, motivo_ban, inicio_ban, fin_ban, responsable_baneo)
         VALUES ($1, $2, $3, $4, $5)`,
        [idUsuario, motivoBanId, inicioBan.toISOString(), finBan.toISOString(), responsable]
      )

      const result = await client.query(
        `UPDATE tabla_usuarios
         SET estado_usuario = FALSE,
             fecha_actualizacion = CURRENT_TIMESTAMP,
             fecha_desactivacion = CURRENT_TIMESTAMP
         WHERE id_usuario = $1
         RETURNING id_usuario, estado_usuario AS estado`,
        [idUsuario]
      )

      await client.query("COMMIT")

      const correoRes = await client.query(
          "SELECT correo_usuario AS correo FROM tabla_usuarios_credenciales WHERE id_usuario = $1 LIMIT 1",
        [idUsuario]
      )
      const correo = correoRes.rows[0]?.correo
      if (correo) {
        await sendBanNotificationEmail(correo, motivoBanDescripcion, inicioBan, finBan)
      }

      return NextResponse.json({
        ok: true,
        message: "Usuario banneado correctamente",
        user: result.rows[0],
      })
    }

    if (action === "unban" || action === "validate") {
      const result = await client.query(
        `UPDATE tabla_usuarios
         SET estado_usuario = TRUE,
             fecha_actualizacion = CURRENT_TIMESTAMP,
             fecha_desactivacion = NULL
         WHERE id_usuario = $1
         RETURNING id_usuario, estado_usuario AS estado`,
        [userIdToToggle]
      )

      const correoRes = await client.query(
        "SELECT correo_usuario AS correo FROM tabla_usuarios_credenciales WHERE id_usuario = $1 LIMIT 1",
        [userIdToToggle]
      )
      const correo = correoRes.rows[0]?.correo
      console.log("Correo desbaneo:", correo)
      if (correo) {
        await sendUnbanNotificationEmail(correo)
      }

      return NextResponse.json({
        ok: true,
        message: action === "validate" ? "Usuario validado correctamente" : "Usuario desbanneado correctamente",
        user: result.rows[0],
      })
    }

    return NextResponse.json({ ok: false, message: "Acción inválida. Usa action=ban, action=unban o action=validate" }, { status: 400 })
  } catch (error) {
    try {
      await client.query("ROLLBACK")
    } catch {}
    console.error("Error toggling user ban status:", error)
    return NextResponse.json({ ok: false, message: "Error actualizando estado del usuario" }, { status: 500 })
  } finally {
    client.release()
  }
}
