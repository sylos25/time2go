import { NextResponse } from "next/server";
import { searchSitios } from "@/app/api/llamar_sitio/lib/llamar-sitio-repository";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nombreSitio = searchParams.get("nombre_sitio")?.trim() ?? "";

  try {
    return NextResponse.json(await searchSitios(nombreSitio), { status: 200 });
  } catch (error) {
    console.error("Error al buscar sitios:", error);
    return NextResponse.json(
      { message: "Error al buscar sitios" },
      { status: 500 }
    );
  }
}
