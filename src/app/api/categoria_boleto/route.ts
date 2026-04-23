import { NextResponse } from "next/server";
import { listCategoriaBoletos } from "@/app/api/categoria_boleto/lib/categoria-boleto-repository";

export async function GET() {
  try {
    return NextResponse.json(await listCategoriaBoletos());
  } catch (error) {
    console.error("Error fetching categorías de boleto:", error);
    return NextResponse.json(
      { error: "Error al obtener las categorías de boleto" },
      { status: 500 }
    );
  }
}
