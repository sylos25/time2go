import { NextRequest, NextResponse } from "next/server";
import {
  confirmPasswordReset,
  requestPasswordReset,
  validateResetToken,
} from "@/app/api/reset-password/lib/reset-password-service";
import {
  parseResetPasswordConfirmBody,
  parseResetPasswordRequestBody,
  readResetPasswordTokenFromQuery,
} from "@/app/api/reset-password/lib/reset-password-validation";

export async function GET(req: NextRequest) {
  try {
    const tokenResult = readResetPasswordTokenFromQuery(req);
    if (!tokenResult.ok) {
      return tokenResult.response;
    }
    return await validateResetToken(tokenResult.token);
  } catch (err) {
    console.error("Reset password token validation error:", err);
    return NextResponse.json({ ok: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseResetPasswordRequestBody(req);
    if (!parsed.ok) {
      return parsed.response;
    }

    return await requestPasswordReset(req, parsed.email);
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const parsed = await parseResetPasswordConfirmBody(req);
    if (!parsed.ok) {
      return parsed.response;
    }

    return await confirmPasswordReset(parsed.data.token, parsed.data.newPassword);
  } catch (err) {
    console.error("Reset password confirmation error:", err);
    return NextResponse.json({ ok: false, error: "Error interno del servidor" }, { status: 500 });
  }
}
