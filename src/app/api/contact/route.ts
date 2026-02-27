import { NextResponse } from "next/server"
import { sendContactMessageEmail } from "@/lib/email"

export const runtime = "nodejs"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = String(body?.name || "").trim()
    const email = String(body?.email || "").trim().toLowerCase()
    const subject = String(body?.subject || "").trim()
    const message = String(body?.message || "").trim()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      )
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Correo electrónico inválido" },
        { status: 400 }
      )
    }

    if (name.length > 120 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json(
        { error: "Uno o más campos superan la longitud permitida" },
        { status: 400 }
      )
    }

    const emailSent = await sendContactMessageEmail({
      name,
      email,
      subject,
      message,
    })

    if (!emailSent) {
      return NextResponse.json(
        { error: "No se pudo enviar el mensaje en este momento" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Mensaje enviado correctamente" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error en /api/contact:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
