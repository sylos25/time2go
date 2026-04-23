import { NextResponse } from "next/server";
import { getJwtPayloadStrict } from "@/lib/auth-request";
import { mapTransactionRows } from "@/app/api/mis-transacciones/lib/mis-transacciones-mappers";
import { listUserTransactions } from "@/app/api/mis-transacciones/lib/mis-transacciones-repository";

const ALLOWED_ROLES = new Set([1, 2]);

export async function GET(req: Request) {
  try {
    const payload = await getJwtPayloadStrict(req);
    if (!payload?.id_usuario) {
      const authHeader = req.headers.get("authorization") || "";
      const message = authHeader.startsWith("Bearer ") ? "Invalid token" : "No authenticated user";
      return NextResponse.json({ ok: false, message }, { status: 401 });
    }

    const role = Number(payload.id_rol || 0);
    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    const userId = Number(payload.id_usuario);
    const transactions = mapTransactionRows(await listUserTransactions(userId));

    return NextResponse.json({
      ok: true,
      transacciones: transactions,
    });
  } catch (error) {
    console.error("/api/mis-transacciones GET error:", error);
    return NextResponse.json({ ok: false, message: "Error al cargar transacciones" }, { status: 500 });
  }
}
