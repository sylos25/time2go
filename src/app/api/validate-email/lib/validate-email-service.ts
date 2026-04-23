import { NextResponse } from "next/server";
import {
  findEmailValidationToken,
  markEmailTokenAsUsed,
  markUserEmailValidated,
} from "@/app/api/validate-email/lib/validate-email-repository";

export async function validateEmailWithToken(token: string): Promise<NextResponse> {
  const tokenData = await findEmailValidationToken(token);

  if (!tokenData) {
    return NextResponse.json({ error: "Token inválido" }, { status: 404 });
  }

  if (tokenData.utilizado) {
    return NextResponse.json({ error: "Este token ya ha sido utilizado" }, { status: 400 });
  }

  const now = new Date();
  const expirationDate = new Date(tokenData.fecha_expiracion);
  if (now > expirationDate) {
    return NextResponse.json({ error: "El token ha expirado" }, { status: 400 });
  }

  await markUserEmailValidated(tokenData.id_usuario);
  await markEmailTokenAsUsed(token);

  return NextResponse.json(
    {
      message: "Correo validado correctamente",
      id_usuario: tokenData.id_usuario,
    },
    { status: 200 }
  );
}
