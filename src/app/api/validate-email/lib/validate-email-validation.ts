import { NextRequest, NextResponse } from "next/server";

export function readEmailValidationToken(
  req: NextRequest
): { ok: true; token: string } | { ok: false; response: NextResponse } {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Token no proporcionado" }, { status: 400 }),
    };
  }

  return { ok: true, token };
}
