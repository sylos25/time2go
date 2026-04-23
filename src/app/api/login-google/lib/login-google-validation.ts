import { NextResponse } from "next/server";

export async function parseGoogleCredential(req: Request): Promise<
  | { ok: true; credential: string }
  | { ok: false; response: NextResponse }
> {
  const body = (await req.json()) as { credential?: string };
  const credential = String(body?.credential || "").trim();

  if (!credential) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Token requerido" }, { status: 400 }),
    };
  }

  return { ok: true, credential };
}

export function getGoogleClientId(): string | null {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  return clientId ? clientId.trim() : null;
}
