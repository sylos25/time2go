import { NextRequest, NextResponse } from "next/server";
import { validateEmailWithToken } from "@/app/api/validate-email/lib/validate-email-service";
import { readEmailValidationToken } from "@/app/api/validate-email/lib/validate-email-validation";

export async function GET(req: NextRequest) {
  try {
    const tokenResult = readEmailValidationToken(req);
    if (!tokenResult.ok) {
      return tokenResult.response;
    }

    return await validateEmailWithToken(tokenResult.token);
  } catch (error) {
    console.error("Error en validate-email:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
