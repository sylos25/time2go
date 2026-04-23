import { NextResponse } from "next/server";
import { mapPaisesToOptions } from "@/app/api/llamar_pais/lib/llamar-pais-mappers";
import { listPaises } from "@/app/api/llamar_pais/lib/llamar-pais-repository";

export async function GET() {
  try {
    return NextResponse.json(mapPaisesToOptions(await listPaises()), { status: 200 });
  } catch (error) {
    console.error("Error al consultar países:", error);
    return NextResponse.json(
      { error: "Error al consultar países" },
      { status: 500 }
    );
  }
}
