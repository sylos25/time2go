import { NextResponse } from "next/server"
import { listTipoSitios } from "@/app/api/tipo-sitios/lib/tipo-sitios-repository"

export async function GET() {
  try {
    return NextResponse.json({ tipos: await listTipoSitios() })
  } catch (error) {
    console.error("Error fetching tipo sitios:", error)
    return NextResponse.json(
      { error: "Error al obtener tipos de sitios" },
      { status: 500 }
    )
  }
}
