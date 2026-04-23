import { NextResponse } from "next/server";
import {
  listMunicipios,
  listMunicipiosBySitioId,
} from "@/app/api/municipios/lib/municipios-repository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sitioId = Number(searchParams.get("sitioId"));

    if (!sitioId) {
      return NextResponse.json(await listMunicipios(), { status: 200 });
    }

    return NextResponse.json(await listMunicipiosBySitioId(sitioId), { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener municipios" },
      { status: 500 }
    );
  }
}
