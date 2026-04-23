import { NextResponse } from "next/server"
import { listDepartamentos } from "@/app/api/departamentos/lib/departamentos-repository"

export async function GET() {
  try {
    return NextResponse.json({ departamentos: await listDepartamentos() })
  } catch (error) {
    console.error("Error fetching departamentos:", error)
    return NextResponse.json(
      { error: "Error al obtener departamentos" },
      { status: 500 }
    )
  }
}
