import { NextResponse } from "next/server";
import { changePasswordBodySchema } from "@/lib/validation/api-schemas";
import { validatePasswordPolicy } from "@/lib/password-policy";

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export async function parseChangePasswordInput(
  req: Request
): Promise<
  | { ok: true; data: ChangePasswordInput }
  | { ok: false; response: NextResponse }
> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, message: "JSON inválido" }, { status: 400 }),
    };
  }

  const parsed = changePasswordBodySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, message: "Datos inválidos" }, { status: 400 }),
    };
  }

  const { currentPassword, newPassword, confirmPassword } = parsed.data;

  if (newPassword !== confirmPassword) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "Las contraseñas no coinciden" },
        { status: 400 }
      ),
    };
  }

  const passwordValidation = validatePasswordPolicy(newPassword);
  if (!passwordValidation.isValid) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: passwordValidation.errors.join(". ") },
        { status: 400 }
      ),
    };
  }

  return {
    ok: true,
    data: { currentPassword, newPassword, confirmPassword },
  };
}

export function unauthorizedChangePasswordResponse(req: Request): NextResponse {
  const authHeader = req.headers.get("authorization") || "";
  const message = authHeader.startsWith("Bearer ") ? "Token inválido" : "No autorizado";
  return NextResponse.json({ ok: false, message }, { status: 401 });
}
