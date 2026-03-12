import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { sendBanNotificationEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { id_usuario } = await req.json()

    if (!id_usuario) {
      return NextResponse.json(
        { error: "id_usuario no proporcionado" },
        { status: 400 }
      )
    }

    // Obtener el motivo del baneo más reciente del usuario junto a su correo
    const banResult = await pool.query(
      `SELECT b.motivo_ban, u.correo
       FROM tabla_baneados b
       INNER JOIN tabla_usuarios u ON u.id_usuario = b.id_usuario
       WHERE b.id_usuario = $1
       ORDER BY b.inicio_ban DESC
       LIMIT 1`,
      [id_usuario]
    )

    if (banResult.rowCount === 0) {
      return NextResponse.json(
        { error: "No se encontró un baneo para este usuario" },
        { status: 404 }
      )
    }

    const { motivo_ban, correo } = banResult.rows[0]

    if (!correo) {
      return NextResponse.json(
        { error: "El usuario no tiene correo registrado" },
        { status: 400 }
      )
    }

    const sent = await sendBanNotificationEmail(correo, motivo_ban)

    if (!sent) {
      return NextResponse.json(
        { error: "No se pudo enviar el correo de notificación" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Correo de baneo enviado correctamente" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error en notify-ban:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}