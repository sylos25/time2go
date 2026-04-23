import { NextResponse } from "next/server"
import { sendContactMessage } from "@/app/api/contact/lib/contact-service"
import {
  parseContactPayload,
  validateContactPayload,
} from "@/app/api/contact/lib/contact-validation"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const payload = parseContactPayload(await req.json())
    const validationError = validateContactPayload(payload)

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      )
    }

    const emailSent = await sendContactMessage(payload)

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
