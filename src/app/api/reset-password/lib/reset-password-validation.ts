import { NextRequest, NextResponse } from "next/server";
import { validatePasswordPolicy } from "@/lib/password-policy";
import type { PasswordResetConfirmInput } from "@/app/api/reset-password/lib/reset-password-types";

export function readResetPasswordTokenFromQuery(
  req: NextRequest
): { ok: true; token: string } | { ok: false; response: NextResponse } {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: "Token no proporcionado" }, { status: 400 }),
    };
  }

  return { ok: true, token };
}

export async function parseResetPasswordRequestBody(
  req: NextRequest
): Promise<{ ok: true; email: string } | { ok: false; response: NextResponse }> {
  const body = (await req.json()) as { email?: string };
  const email = typeof body?.email === "string" ? body.email : "";

  if (!email) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Correo electrónico requerido" }, { status: 400 }),
    };
  }

  return { ok: true, email };
}

export async function parseResetPasswordConfirmBody(
  req: NextRequest
): Promise<
  | { ok: true; data: PasswordResetConfirmInput }
  | { ok: false; response: NextResponse }
> {
  const body = (await req.json()) as {
    token?: string;
    newPassword?: string;
    confirmPassword?: string;
  };

  const token = typeof body?.token === "string" ? body.token : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
  const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: "Token no proporcionado" }, { status: 400 }),
    };
  }

  if (!newPassword || !confirmPassword) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "La nueva contraseña y su confirmación son obligatorias" },
        { status: 400 }
      ),
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: "Las contraseñas no coinciden" }, { status: 400 }),
    };
  }

  const passwordValidation = validatePasswordPolicy(newPassword);
  if (!passwordValidation.isValid) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: passwordValidation.errors.join(". ") },
        { status: 400 }
      ),
    };
  }

  return {
    ok: true,
    data: { token, newPassword, confirmPassword },
  };
}
